<template>
  <!-- root node required -->
  <div>
    <div id="map"></div>
    <component is="seeker" v-if="probe" :probe="probe" :current-time="currentTime"></component>
  </div>
</template>

<script>
import { Toast } from 'quasar'
import { MixinStore } from 'weacast-client'

import config from 'config'
import api from 'src/api'

import { loadComponent } from '../utils'

export default {
  props: ['forecastModel'],
  // Make the seeker component available to Vue dynamically
  components: {
    seeker: loadComponent(config.map ? config.map.seeker : 'WindSeeker')
  },
  // Jump from mixin names to mixin objects
  mixins: config.map.mixins.map(mixinName => MixinStore.get(mixinName)),
  data () {
    return {
      probe: null
    }
  },
  watch: {
    forecastModel: function (model) {
      this.setupDefaultProbe()
    }
  },
  methods: {
    async setupDefaultProbe () {
      // Not yet ready
      if (!this.forecastModel) return
      // Remove default layer if any
      if (this.probeLayer) this.removeLayer(this.probeLayer)
      // Retrieve the available probes
      let probes = await api.probes.find({ query: { $paginate: false, $select: ['elements', 'forecast'] } })
      // Find the right one for current model
      this.defaultProbe = probes.find(probe => probe.forecast === this.forecastModel.name)
      if (this.defaultProbe) {
        Toast.create.positive('Forecast data has been probed you can now search matching conditions')
        // Update content to get features
        this.defaultProbe = await api.probes.get(this.defaultProbe._id, { query: { $select: ['elements', 'forecast', 'features'] } })
        this.probe = this.defaultProbe
        /* Do not add default probe layer
        this.probeLayer = this.addGeoJsonCluster({
          type: 'FeatureCollection',
          features: this.probe.features
        }, 'Probe')
        */
      }
      else {
        Toast.create.negative('Forecast data has not been probed you cannot search matching weather conditions')
      }
    },
    performProbing (geojson) {
      // Not yet ready
      if (!this.forecastModel) return

      // Set forecast elements to probe
      Object.assign(geojson, {
        forecast: this.forecastModel.name,
        elements: this.forecastModel.elements.map(element => element.name)
      })
      return api.probes
      .create(geojson, {
        query: {
          forecastTime: this.currentTime.format()
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
  mounted () {
    this.$emit('mapReady')
    this.setupDefaultProbe()
    this.$on('currentTimeChanged', currentTime => {
      if (this.userProbe) {
        // Perform new on-demand probe for new time
        this.performProbing(this.userProbe)
      }
    })
    this.$on('fileLayerLoaded', (fileLayer, filename) => {
      // Remove default layer if any
      if (this.probeLayer) this.removeLayer(this.probeLayer)
      // Perform probing
      this.performProbing(fileLayer.toGeoJSON())
    })
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
