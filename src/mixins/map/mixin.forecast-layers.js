import L from 'leaflet'
import moment from 'moment'
import 'leaflet-timedimension/dist/leaflet.timedimension.src.js'
import 'leaflet-timedimension/dist/leaflet.timedimension.control.css'
import 'iso8601-js-period/iso8601.js'
import '../../layers'

import store from '../store'

let forecastLayersMixin = {
  data () {
    return {
      currentTime: null
    }
  },
  watch: {
    forecastModel: function (model) {
      this.setupForecastLayers()
    }
  },
  methods: {
    setupForecastLayers () {
      // Not yet ready
      if (!this.forecastModel || !this.map || !this.map.timeDimension) return

      this.forecastLayers.forEach(layer => this.removeLayer(layer))
      this.forecastLayers = []
      this.configuration.forecastLayers.forEach(layerConfig => {
        let layer = new L.Weacast[layerConfig.type](this.api, layerConfig.options)
        this.addLayer(layer, layerConfig.name)
        // For visualization we might decimate the data resolution for performance reasons
        let decimationFactor = layerConfig.decimationFactor || 2
        let visualModel = {
          name: this.forecastModel.name,
          origin: this.forecastModel.origin,
          bounds: this.forecastModel.bounds,
          size: [Math.floor(this.forecastModel.size[0] / decimationFactor), Math.floor(this.forecastModel.size[1] / decimationFactor)],
          resolution: [decimationFactor * this.forecastModel.resolution[0], decimationFactor * this.forecastModel.resolution[1]]
        }
        // Should come last so that we do not trigger multiple updates of data
        layer.setForecastModel(visualModel)
        this.forecastLayers.push(layer)
      })
    },
    setCurrentTime (datetime) {
      // String or milliseconds
      if (typeof datetime === 'string' || Number.isInteger(datetime)) {
        this.currentTime = moment.utc(datetime)
      } else {
        this.currentTime = datetime
      }
      this.$emit('currentTimeChanged', this.currentTime)
      // Synchronize UI when the time has been set programmatically
      if (this.map.timeDimension.getCurrentTime() !== this.currentTime.valueOf()) {
        this.map.timeDimension.setCurrentTime(this.currentTime.valueOf())
      }
    }
  },
  created () {
    // This is the right place to declare private members because Vue has already processed observed data
    this.forecastLayers = []
  },
  mounted () {
    let timeDimension = L.timeDimension({})
    timeDimension.on('timeload', data => {
      this.setCurrentTime(data.time)
    })
    let timeDimensionControl = L.control.timeDimension({
      timeDimension,
      position: 'bottomright',
      speedSlider: false,
      playButton: false,
      playerOptions: { minBufferReady: -1 } // This avoid preloading of next times
    })
    this.controls.push(timeDimensionControl)
    // Make time dimension available
    this.$on('mapReady', _ => {
      this.map.timeDimension = timeDimension
      this.setupForecastLayers()
    })
  }
}

store.set('forecastLayers', forecastLayersMixin)

export default forecastLayersMixin
