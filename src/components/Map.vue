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
import 'leaflet-velocity/dist/leaflet-velocity.js'
import 'leaflet-velocity/dist/leaflet-velocity.css'

import api from 'src/api'

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
    }
  },
  watch: {
    forecastModel: function (model) {
      this.updateWind()
    }
  },
  methods: {
    updateWind () {
      // Query wind for current time
      let query = {
        query: {
          time: new Date().toISOString(),
          '$select': ['data']
        }
      }
      // Format in leaflet-velocity layer data model
      let uheader = {
        parameterCategory: 2,
        parameterNumber: 2,
        nx: this.forecastModel.size[0],
        ny: this.forecastModel.size[1],
        lo1: this.forecastModel.origin[0],
        la1: this.forecastModel.origin[1],
        dx: this.forecastModel.resolution[0],
        dy: this.forecastModel.resolution[0]
      }
      let vheader = Object.assign({}, uheader)
      vheader.parameterNumber = 3
      let udata, vdata
      api.service('/' + this.forecastModel.name + '/u-wind').find(query)
      .then(response => {
        udata = response.data[0].data
        return api.service('/' + this.forecastModel.name + '/v-wind').find(query)
      })
      .then(response => {
        vdata = response.data[0].data
        this.wind.setData([{
          header: uheader,
          data: udata
        }, {
          header: vheader,
          data: vdata
        }])
      })
    }
  },
  mounted () {
    var map = L.map('map').setView([46.578992, -0.294869], 10)
    this.map = map

    let osm = L.tileLayer(config.streetsUrl, {
      maxZoom: 20,
      label: 'Streets'
    })

    let sat = L.tileLayer(config.satelliteUrl, {
      maxZoom: 20,
      label: 'Satellite'
    })

    this.wind = L.velocityLayer({
      displayValues: false,
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
    map.addLayer(this.wind)

    var basemaps = [ osm, sat ]

    var scaleControl = L.control.scale()
    scaleControl.addTo(map)

    this.basemapsControl = L.control.basemaps({
      basemaps: basemaps,
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
