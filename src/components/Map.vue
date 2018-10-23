<template>
  <!-- root node required -->
  <div>
    <div id="map"></div>
    <component is="location" :feature="location"></component>
    <component is="seeker" v-if="probe" :probe="probe" :current-time="currentTime" :forecastModel="forecastModel"></component>
    <span v-if="forecastModel" class="chip label bg-white absolute-bottom-right" style="margin-bottom: 1.6em; margin-right: 30em">
      {{forecastModel.label}} - {{forecastModel.description}}
    </span>
  </div>
</template>

<script>
import L from 'leaflet'
import _ from 'lodash'
import { Toast } from 'quasar'
import { MixinStore, WindBarbIcon } from 'weacast-client'

import config from 'config'
import api from 'src/api'

import { loadComponent } from '../utils'

export default {
  props: ['forecastModel'],
  // Make the seeker component available to Vue dynamically
  components: {
    location: loadComponent(config.map ? config.map.location : 'Location'),
    seeker: loadComponent(config.map ? config.map.seeker : 'WindSeeker')
  },
  // Jump from mixin names to mixin objects
  mixins: config.map.mixins.map(mixinName => MixinStore.get(mixinName)),
  data () {
    return {
      probe: null,
      location: null
    }
  },
  watch: {
    forecastModel: function (model) {
      this.setupDefaultProbes()
    }
  },
  methods: {
    async setupDefaultProbes () {
      // Not yet ready
      if (!this.forecastModel) return
      // Remove previous layer if any
      this.removeLayer(this.probeLayer)
      this.probeLayer = null
      // Retrieve the available probes
      let probes = await api.probes.find({ query: { $paginate: false, $select: ['elements', 'forecast'] } })
      // Find the right one for current model
      this.defaultProbe = probes.find(probe => probe.forecast === this.forecastModel.name)
      if (this.defaultProbe) {
        Toast.create.positive('Forecast data has associated probes so you can search matching conditions')
        // Update content to get features
        this.defaultProbe = await api.probes.get(this.defaultProbe._id,
          { query: { $select: ['elements', 'forecast', 'features'] } })
        this.probe = this.defaultProbe
        this.probeLayer = this.addGeoJsonCluster({
          type: 'FeatureCollection',
          features: this.probe.features
        }, 'Default probes')
      }
      else {
        Toast.create.negative('Forecast data has no associated probes so you cannot search matching weather conditions')
      }
    },
    async performProbing () {
      // Not yet ready
      if (!this.forecastModel) return

      // Set forecast elements to probe
      Object.assign(this.geojson, {
        forecast: this.forecastModel.name,
        elements: this.forecastModel.elements.map(element => element.name)
      })
      let response = await api.probes
      .create(this.geojson, {
        query: {
          forecastTime: this.currentTime.format()
        }
      })
      // Remove original file layer
      this.removeLayer(this.fileLayer)
      // Remove previous probed layer if any
      this.removeLayer(this.probeLayer)
      // Then create probed layer
      this.probeLayer = this.addGeoJsonCluster({
        type: 'FeatureCollection',
        features: response.features
      }, 'Default probes')
      this.userProbe = response
      this.probe = this.userProbe
      Toast.create.positive('Forecast data has been probed for your layer so you can now search matching conditions')
    },
    async probeDynamicLocation (long, lat) {
      // Not yet ready
      if (!this.forecastModel) return
      // From now to last available time
      const times = this.map.timeDimension.getAvailableTimes()
      const geometry = {
        type: 'Point',
        coordinates: [ long, lat ]
      }
      const query = {
        forecastTime: {
          $gte: new Date(times[0]).toISOString(),
          $lte: new Date(times[times.length - 1]).toISOString()
        },
        geometry: {
          $geoIntersects: {
            $geometry: geometry
          }
        }
      }
      // Remove previous location layer if any
      this.removeLayer(this.locationLayer)
      this.locationLayer = null
      let locationMarker = L.marker([lat, long]).addTo(this.map)
      .bindTooltip('Please wait while probing location', { permanent: true })
      .openTooltip()

      try {
        let response = await api.probes
        .create({
          forecast: this.forecastModel.name,
          elements: this.forecastModel.elements.map(element => element.name)
        }, { query })
        locationMarker.remove()
        this.location = response.features[0]
        // Then create location layer
        this.locationLayer = this.addGeoJson(this.getLocationAtCurrentTime(), 'Probed location')
      }
      catch (error) {
        console.log(error)
        locationMarker.remove()
      }
    },
    async probeStaticLocation (featureId) {
      // Check if probe is streamed so we need to retrieve results first
      if (!this.probe._id) return
      // Remove previous location layer if any
      this.removeLayer(this.locationLayer)
      this.locationLayer = null
      const times = this.map.timeDimension.getAvailableTimes()
      try {
        let results = await api.probeResults.find({
          query: {
            probeId: this.probe._id,
            forecastTime: {
              $gte: new Date(times[0]).toISOString(),
              $lte: new Date(times[times.length - 1]).toISOString()
            },
            'properties.iata_code': featureId,
            $groupBy: 'properties.iata_code',
            $aggregate: ['windDirection', 'windSpeed', 'gust']
          }
        })
        if (results.length > 0) this.location = results[0]
        this.location.type = 'Feature'
        // Then create location layer
        this.locationLayer = this.addGeoJson(this.getLocationAtCurrentTime(), 'Probed location')
      }
      catch (error) {
        console.log(error)
      }
    },
    getValueAtCurrentTime (times, values) {
      // Check for the right value at time
      if (Array.isArray(times) && Array.isArray(values)) {
        const currentTime = this.currentTime.valueOf()
        const index = times.findIndex(time => new Date(time).getTime() === currentTime)
        return values[index]
      } // Constant value
      else {
        return values
      }
    },
    getLocationAtCurrentTime () {
      // Create new geojson from raw response containing all times
      let feature = _.cloneDeep(this.location)
      // Then check for the right value at time
      _.forOwn(feature.properties, (value, key) => {
        if (Array.isArray(value)) {
          feature.properties[key] = this.getValueAtCurrentTime(feature.forecastTime[key], value)
        }
      })
      return feature
    },
    getPointMarker (feature, latlng) {
      const properties = feature.properties
      // Use wind barbs on probed features
      if (properties && properties.windDirection && properties.windSpeed) {
        let icon = new WindBarbIcon({
          deg: properties.windDirection,
          speed: properties.windSpeed / 0.514, // Expressed as knots
          pointRadius: 10,
          pointColor: '#2B85C7',
          pointStroke: '#111',
          strokeWidth: 2,
          strokeColor: '#000',
          strokeLength: 12,
          barbSpaceing: 4,
          barbHeight: 10,
          forceDir: true
        })
        return L.marker(latlng, { icon })
      }
      else {
        let marker = this.createMarkerFromStyle(latlng, this.configuration.pointStyle)
        marker.on('click', event => this.probeStaticLocation(properties.iata_code))
        return marker
      }
    },
    onProbeLocation (event) {
      this.probeDynamicLocation(event.latlng.lng, event.latlng.lat)
    },
    onUserProbeLoaded (fileLayer, filename) {
      this.geojson = fileLayer.toGeoJSON()
      // Perform probing
      this.performProbing()
    },
    onTimeChanged (currentTime) {
      if (this.userProbe) {
        // Perform new on-demand probe for new time
        this.performProbing()
      }
      if (this.locationLayer) {
        // Reset styling to display according to new time
        this.removeLayer(this.locationLayer)
        this.locationLayer = this.addGeoJson(this.getLocationAtCurrentTime(), 'Probed location')
      }
    },
    onAvailableTimesChanged (availableTimes, currentTime) {
      if (this.locationLayer) {
        // Static location => update results
        if (_.has(this.location, 'properties.iata_code')) {
          this.probeStaticLocation(_.get(this.location, 'properties.iata_code'))
        }
        else { // Dynamic location selected => probe again
          const location = _.get(this.location, 'geometry.coordinates')
          this.probeDynamicLocation(location[0], location[1])
        }
      }
    }
  },
  beforeCreate () {
    // Store configuration object (map section) first to make it available
    // to the whole lifecycle and mixins
    this.configuration = config.map
    // Ibid for API
    this.api = api
  },
  mounted () {
    this.$emit('mapReady')
    this.map.on('dblclick', this.onProbeLocation)
    this.map.timeDimension.on('availabletimeschanged', this.onAvailableTimesChanged)
    this.setupDefaultProbes()
    this.$on('currentTimeChanged', this.onTimeChanged)
    this.$on('fileLayerLoaded', this.onUserProbeLoaded)
  },
  beforeDestroy () {
    this.map.off('dblclick', this.onProbeLocation)
    this.map.timeDimension.off('availabletimeschanged', this.onAvailableTimesChanged)
    this.$off('currentTimeChanged', this.onTimeChanged)
    this.$off('fileLayerLoaded', this.onUserProbeLoaded)
    // Remove layers if any
    this.removeLayer(this.probeLayer)
    this.removeLayer(this.locationLayer)
  }
}
</script>

<style>
#map {
  width: 100%;
  height: 100%;
  font-weight: normal;
  z-index: 0;
}
</style>
