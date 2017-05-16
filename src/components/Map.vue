<template>
  <!-- root node required -->
  <div>
    <!-- your content -->
    <div id="map"></div>
    <q-modal ref="weatherModal" @close="searchWeatherConditions()" :content-css="{padding: '20px', minWidth: '30vw'}">
      <h5>Weather conditions</h5>
      <div>
        <div class="row justify-around">
          <div>
            <p class="caption">Wind speed (m/s)</p>
            <q-range v-model="weather.windSpeed" :min="0" :max="20" :step="0.5" label></q-range>
          </div>
          <div>
            <p class="caption">Wind direction (°)</p>
            <q-knob v-model="weather.windDirection" :placeholder="weather.windDirection+'°'" :min="0" :max="360"></q-knob>
          </div>
        </div>
        <div class="row justify-around">
          <div>
            <p class="caption">Label property</p>
            <q-dialog-select
              type="radio"
              v-model="weather.labelProperty"
              :options="getPropertyList()"
              ok-label="OK"
              cancel-label="Cancel"
              title="Label property"
            ></q-dialog-select>
          </div>
          <div>
            <p class="caption">Direction property</p>
            <q-dialog-select
              type="radio"
              v-model="weather.windProperty"
              :options="getPropertyList()"
              ok-label="OK"
              cancel-label="Cancel"
              title="Direction property"
            ></q-dialog-select>
          </div>
        </div>
      </div>
      <button class="orange" @click="$refs.weatherModal.close()">Search</button>
    </q-modal>
    <button v-if="this.userProbe" class="white circular absolute-bottom-right" style="margin-bottom: 6em; margin-right: 1em" @click="$refs.weatherModal.open()">
      <i>search</i>
    </button>
  </div>
</template>

<script>
import { Toast, Dialog } from 'quasar'
import config from 'config'
import api from 'src/api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-measure/dist/leaflet-measure.js'
import 'leaflet-measure/dist/leaflet-measure.css'
import 'leaflet-basemaps/L.Control.Basemaps.js'
import 'leaflet-basemaps/L.Control.Basemaps.css'
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js'
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css'
import 'leaflet-filelayer'
import 'leaflet-timedimension/dist/leaflet.timedimension.src.js'
import 'leaflet-timedimension/dist/leaflet.timedimension.control.css'

import FlowLayer from 'weacast-core/lib/layers/flow-layer.js'
// Heat layer does not work well to represent scalar value at low resolution due to lat/lon distortions
// import HeatLayer from 'weacast-core/lib/layers/heat-layer.js'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  props: ['forecastModel'],
  data () {
    return {
      baseLayers: [],
      weather: {
        windDirection: 0.0,
        windSpeed: 10,
        windProperty: '',
        labelProperty: ''
      },
      userProbe: null
    }
  },
  watch: {
    forecastModel: function (model) {
      this.setupForecastLayers()
    }
  },
  methods: {
    setupBaseLayers () {
      config.baseLayers.forEach(baseLayer => {
        this.baseLayers.push(L[baseLayer.type](...baseLayer.arguments))
      })
    },
    setupForecastLayers () {
      // Not yet ready
      if (!this.forecastModel) return

      /*
      if (this.temperature) {
        this.map.removeLayer(this.temperature)
      }
      this.temperature = new HeatLayer({
        element: 'temperature',
        attribution: this.forecastModel.attribution
      })
      this.map.addLayer(this.temperature)
      // Should come last so that we do not tirgger multiple updates of data
      this.temperature.setForecastModel(this.forecastModel)
      */
      if (this.wind) {
        this.map.removeLayer(this.wind)
      }
      this.wind = new FlowLayer({
        uElement: 'u-wind',
        vElement: 'v-wind',
        attribution: this.forecastModel.attribution
      })
      this.map.addLayer(this.wind)
      // Should come last so that we do not tirgger multiple updates of data
      this.wind.setForecastModel(this.forecastModel)
    },
    probe () {
      // Set forecast elements to probe
      this.userGeoJson.properties = {
        forecast: this.forecastModel.name,
        elements: ['u-wind', 'v-wind'],
        time: this.currentTime.toISOString()
      }
      return api.probes
      .create(this.userGeoJson)
      .then(response => {
        this.userProbe = response
        Toast.create.positive('Forecast data has been probed for your layer you can now search matching conditions')
      })
    },
    currentTimeChanged () {
      if (this.userProbe) {
        // Remove old probe
        api.probes.remove(this.userProbe._id)
        // Create new one for new time
        .then(_ => this.probe())
      }
    },
    getPropertyList () {
      if (!this.userProbe) return []
      return Object.keys(this.userProbe.features[0].properties).map(property => {
        return {
          label: property,
          value: property
        }
      })
    },
    searchWeatherConditions () {
      let bestLocation, bestDirection, bestSpeed
      let minDelta = 999
      this.userProbe.features.forEach(location => {
        let u = Object.values(location.properties[this.forecastModel.name + '/u-wind'])[0]
        let v = Object.values(location.properties[this.forecastModel.name + '/v-wind'])[0]
        let norm = Math.sqrt(u * u + v * v)
        let degrees = 180.0 + Math.atan2(u, v) * 180.0 / Math.PI
        let direction = this.weather.windDirection
        if (this.weather.windProperty) {
          direction += parseFloat(location.properties[this.weather.windProperty])
          if (direction > 360) direction -= 360
        }
        let directionDelta = Math.abs(degrees - direction)
        let speedDelta = Math.abs(norm - this.weather.windSpeed)
        let delta = 0.5 * directionDelta / 360 + 0.5 * speedDelta / 50
        if (delta < minDelta) {
          minDelta = delta
          bestDirection = degrees
          bestSpeed = norm
          bestLocation = location
        }
      })
      if (bestLocation) {
        Dialog.create({
          title: 'Results',
          message: (this.weather.labelProperty ? bestLocation.properties[this.weather.labelProperty] : 'Location ') + ' with ' + bestDirection.toFixed(2) + '° and ' + bestSpeed.toFixed(2) + ' m/s',
          buttons: [
            {
              label: 'LOCATE',
              handler: () => {
                this.map.setView(new L.LatLng(bestLocation.geometry.coordinates[1], bestLocation.geometry.coordinates[0]), 12)
              }
            }
          ]
        })
      }
      else {
        Dialog.create({
          title: 'Alert',
          message: 'No matching airport found for your input.'
        })
      }
    }
  },
  mounted () {
    var map = L.map('map', {
      timeDimension: true,
      timeDimensionControl: true,
      timeDimensionControlOptions: {
        position: 'bottomright',
        speedSlider: false,
        playButton: false
      }
    }).setView([46.578992, -0.294869], 10)
    this.map = map
    map.timeDimension.on('timeload', data => {
      this.currentTime = new Date(data.time)
      this.currentTimeChanged()
    })

    this.setupBaseLayers()
    this.setupForecastLayers()

    var scaleControl = L.control.scale()
    scaleControl.addTo(map)

    this.basemapsControl = L.control.basemaps({
      basemaps: this.baseLayers,
      position: 'bottomleft',
      tileX: 0,  // tile X coordinate
      tileY: 0,  // tile Y coordinate
      tileZ: 1   // tile zoom level
    })
    this.basemapsControl.addTo(map)

    var measureControl = new L.Control.Measure({ position: 'topright' })
    measureControl.addTo(map)

    // This one is used to add custom user layers
    var switchControl = L.control.layers([], [])
    switchControl.addTo(map)
    switchControl.getContainer().style.visibility = 'hidden'

    var fullscreenControl = new L.Control.Fullscreen()
    fullscreenControl.addTo(map)

    var geojsonOptions = {
      onEachFeature: function (feature, layer) {
        layer.bindPopup(Object.keys(feature.properties).map(function (k) {
          return k + ': ' + feature.properties[k]
        }).join('<br />'), {
          maxHeight: 200
        })
      },
      style: function (feature) {
        return {
          opacity: 1,
          radius: 6,
          color: 'red',
          fillOpacity: 0.5,
          fillColor: 'green'
        }
      },
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          opacity: 1,
          color: 'red',
          fillOpacity: 0.5,
          fillColor: 'green'
        })
      }
    }

    L.Control.FileLayerLoad.LABEL = '<i class="material-icons">file_upload</i>'
    this.fileControl = L.Control.fileLayerLoad({
      // Allows you to use a customized version of L.geoJson.
      // For example if you are using the Proj4Leaflet leaflet plugin,
      // you can pass L.Proj.geoJson and load the files into the
      // L.Proj.GeoJson instead of the L.geoJson.
      layer: L.geoJson,
      // See http://leafletjs.com/reference.html#geojson-options
      layerOptions: geojsonOptions,
      // Add to map after loading (default: true) ?
      addToMap: true,
      // File size limit in kb (default: 1024) ?
      fileSizeLimit: 1024 * 1024,
      // Restrict accepted file formats (default: .geojson, .kml, and .gpx) ?
      formats: [
        '.geojson',
        '.kml'
      ]
    })
    this.fileControl.addTo(map)
    this.fileControl.loader.on('data:loaded', event => {
      // Remove any previous layer
      if (this.userLayer) {
        switchControl.removeLayer(this.userLayer)
        this.map.removeLayer(this.userLayer)
      }
      switchControl.getContainer().style.visibility = 'visible'
      // Add to map layer switcher
      switchControl.addOverlay(event.layer, event.filename)
      // Keep track of layer
      this.userLayer = event.layer
      this.userGeoJson = this.userLayer.toGeoJSON()
      // Perform probing
      this.probe()
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
