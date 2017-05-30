<template>
  <!-- root node required -->
  <div>
    <div id="map"></div>
    <component is="seeker" :probe="probe" :current-time="currentTime" @center="center"></component>
  </div>
</template>

<script>
import { Toast } from 'quasar'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { MixinStore } from 'weacast-client'

import config from 'config'
import api from 'src/api'

// FIXME : Dynamic component loading based on config does not work
// import seeker from './WindSeeker'
import seeker from './RunwaySeeker'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  props: ['forecastModel'],
  // Make the seeker component available to Vue but take care that in config we have the element name not the file name
  components: {
    // FIXME : Dynamic component loading based on config does not work
    // seeker: loadComponent(config.seeker)
    seeker: seeker
  },
  // Jump from mixin names to mixin objects
  mixins: config.map.mixins.map(mixinName => MixinStore.get(mixinName)),
  data () {
    return {
      currentTime: null
    }
  },
  watch: {
    forecastModel: function (model) {
      this.setupDefaultProbe()
    }
  },
  methods: {
    setupControls () {
      this.controls.forEach(control => control.addTo(this.map))
    },
    center (longitude, latitude, zoomLevel) {
      this.map.setView(new L.LatLng(latitude, longitude), zoomLevel || 12)
    },
    async setupDefaultProbe () {
      // Not yet ready
      if (!this.forecastModel) return
      // Retrieve the available probes
      let probes = await api.probes.find({ query: { $paginate: false, $select: ['elements', 'forecast'] } })
      // Find the right one for current model
      this.defaultProbe = probes.find(probe => probe.forecast === this.forecastModel.name)
      if (this.defaultProbe) {
        Toast.create.positive('Forecast data has been probed you can now search matching conditions')
        // Update content to get features
        this.defaultProbe = await api.probes.get(this.defaultProbe._id, { query: { $select: ['elements', 'forecast', 'features'] } })
        this.probe = this.defaultProbe
      }
      else {
        Toast.create.negative('Forecast data has not been probed you cannot search matching weather conditions')
      }
    },
    async probe (geojson) {
      // Not yet ready
      if (!this.forecastModel) return

      // Set forecast elements to probe
      Object.assign(geojson, {
        forecast: this.forecastModel.name,
        elements: ['u-wind', 'v-wind']
      })
      await api.probes
      .create(geojson, {
        query: {
          forecastTime: this.currentTime.toISOString()
        }
      })
      .then(response => {
        this.userProbe = response
        this.probe = this.userProbe
        Toast.create.positive('Forecast data has been probed for your layer you can now search matching conditions')
      })
    }
  },
  beforeCreate () {
    // Store configuration object (map section) first to make it available
    // to the whole lifecycle and mixins
    this.configuration = config.map
    // Ibid for API
    this.api = api
  },
  created () {
    // This is the right place to declare private members because Vue has already processed observed data
    this.controls = []
  },
  mounted () {
    // Initialize the map now the DOM is ready
    this.map = L.map('map').setView([46.578992, -0.294869], 10)
    this.setupControls()
    this.setupDefaultProbe()

    this.$emit('ready')
    this.$on('center', (longitude, latitude, zoomLevel) => this.center(longitude, latitude, zoomLevel))
    this.$on('currentTimeChanged', currentTime => {
      if (this.userProbe) {
        // Perform new on-demand probe for new time
        this.probe(this.userProbe)
      }
    })
    this.$on('fileLayerLoaded', (fileLayer, filename) => {
      // Perform probing
      this.probe(fileLayer.toGeoJSON())
    })
  },
  beforeDestroy () {
    this.map.remove()
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
