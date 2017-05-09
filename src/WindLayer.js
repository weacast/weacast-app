import L from 'leaflet'
import 'leaflet-velocity/dist/leaflet-velocity.js'
import 'leaflet-velocity/dist/leaflet-velocity.css'
import 'leaflet-timedimension/dist/leaflet.timedimension.src.js'
import api from 'src/api'

let WindLayer = L.TimeDimension.Layer.extend({

  initialize (options) {
    let layer = L.velocityLayer({
      displayValues: true,
      displayOptions: {
        velocityType: 'Wind',
        position: 'bottomright',
        emptyString: 'No wind data'
      },
      // FIXME : make this dynamic
      minVelocity: 3, // used to align color scale
      maxVelocity: 20, // used to align color scale
      velocityScale: 0.005,    // modifier for particle animations, arbitrarily defaults to 0.005
      colorScale: null,
      data: null // data will be requested later
    })
    L.TimeDimension.Layer.prototype.initialize.call(this, layer, options)
    // Format in leaflet-velocity layer data model
    this.uWind = {
      header: {
        parameterCategory: 2,
        parameterNumber: 2
      },
      data: []
    }
    this.vWind = {
      header: {
        parameterCategory: 2,
        parameterNumber: 3
      },
      data: []
    }
  },

  onAdd (map) {
    L.TimeDimension.Layer.prototype.onAdd.call(this, map)
    map.addLayer(this._baseLayer)
    if (this._timeDimension) {
      this.currentForecastTime = new Date(this._timeDimension.getCurrentTime())
      this.fetchData()
    }
  },

  _onNewTimeLoading (event) {
    this.currentForecastTime = new Date(event.time)
    this.fetchData()
  },

  isReady (time) {
    return (this.downloadedForecastTime ? this.downloadedForecastTime.getTime() === time : false)
  },

  _update () {
    this._baseLayer.setData([this.uWind, this.vWind])
    return true
  },

  fetchAvailableTimes () {
    return api.service('/' + this.forecastModel.name + '/u-wind').find({})
    .then(response => {
      let times = response.data.map(item => item.forecastTime)
      this._timeDimension.setAvailableTimes(times.join(), 'replace')
    })
  },

  fetchData () {
    // Not yet ready
    if (!this.forecastModel || !this.currentForecastTime) return
    // Already up-to-date ?
    if (this.downloadedForecastTime &&
        (this.currentForecastTime.getTime() === this.downloadedForecastTime.getTime())) return

    // Query wind for current time
    let query = {
      query: {
        time: this.currentForecastTime.toISOString(),
        '$select': ['forecastTime', 'data']
      }
    }

    api.service('/' + this.forecastModel.name + '/u-wind').find(query)
    .then(response => {
      // Keep track of downloaded data
      this.uWind.data = response.data[0].data
      return api.service('/' + this.forecastModel.name + '/v-wind').find(query)
    })
    .then(response => {
      this.downloadedForecastTime = new Date(response.data[0].forecastTime)
      this.vWind.data = response.data[0].data
    })
  },

  setForecastModel (model) {
    this.forecastModel = model
    // Format in leaflet-velocity layer data model
    let modelHeader = {
      nx: this.forecastModel.size[0],
      ny: this.forecastModel.size[1],
      lo1: this.forecastModel.origin[0],
      la1: this.forecastModel.origin[1],
      dx: this.forecastModel.resolution[0],
      dy: this.forecastModel.resolution[0]
    }
    Object.assign(this.uWind.header, modelHeader)
    Object.assign(this.vWind.header, modelHeader)
    // This will launch a refresh
    this.fetchAvailableTimes()
  }

})

export default WindLayer
