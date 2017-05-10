<template>
  <!-- root node required -->
  <div>
    <!-- your content -->
    <div id="map"></div>
  </div>
</template>

<script>
import config from 'config'
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
      baseLayers: []
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
        element: 'temperature'
      })
      this.temperature.setForecastModel(this.forecastModel)
      this.map.addLayer(this.temperature)
      */
      if (this.wind) {
        this.map.removeLayer(this.wind)
      }
      this.wind = new FlowLayer({
        uElement: 'u-wind',
        vElement: 'v-wind'
      })
      this.map.addLayer(this.wind)
      this.wind.setForecastModel(this.forecastModel)
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
    this.fileControl.loader.on('data:loaded', function (event) {
      switchControl.getContainer().style.visibility = 'visible'
      // Add to map layer switcher
      switchControl.addOverlay(event.layer, event.filename)
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
