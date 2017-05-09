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
// import HeatmapOverlay from 'leaflet-heatmap'
import 'leaflet-timedimension/dist/leaflet.timedimension.src.js'
import 'leaflet-timedimension/dist/leaflet.timedimension.control.css'
import WindLayer from 'src/WindLayer'

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
      // this.updateCloudCover()
      this.updateWind()
    }
  },
  methods: {
    setupBaseLayers () {
      config.baseLayers.forEach(baseLayer => {
        this.baseLayers.push(L[baseLayer.type](...baseLayer.arguments))
      })
    },
    /* Does not seem to work well due to distortions in lat/lon
    updateCloudCover () {
      // Query cloud cover for current time
      let query = {
        query: {
          time: new Date().toISOString(),
          '$select': ['data']
        }
      }

      api.service('/' + this.forecastModel.name + '/u-wind').find(query)
      .then(response => {
        let data = response.data[0].data
        // Depending on the model longitude/latitude increases/decreases according to grid scanning
        let lonDirection = (this.forecastModel.origin[0] === this.forecastModel.bounds[0] ? 1 : -1)
        let latDirection = (this.forecastModel.origin[1] === this.forecastModel.bounds[1] ? 1 : -1)
        let heatdata = []
        for (let j = 0; j < this.forecastModel.size[1]; j++) {
          for (let i = 0; i < this.forecastModel.size[0]; i++) {
            let value = data[i + j * this.forecastModel.size[1]]
            let lng = this.forecastModel.origin[0] + lonDirection * (i * this.forecastModel.resolution[0])
            let lat = this.forecastModel.origin[1] + latDirection * (j * this.forecastModel.resolution[1])
            heatdata.push({
              lat,
              lng,
              value
            })
          }
        }
        this.cloudCover.setData({
          data: heatdata,
          max: 100
        })
      })
    },
    */
    updateWind () {
      this.wind.setForecastModel(this.forecastModel)
    }
  },
  mounted () {
    var map = L.map('map', {
      timeDimension: true,
      timeDimensionControl: true
    }).setView([46.578992, -0.294869], 10)
    this.map = map

    this.setupBaseLayers()

    /*
    this.cloudCover = new HeatmapOverlay({
      // radius should be small ONLY if scaleRadius is true (or small radius is intended)
      // if scaleRadius is false it will be the constant radius used in pixels
      radius: 0.75,
      minOpacity: 0,
      maxOpacity: 0.8,
      // scales the radius based on map zoom
      scaleRadius: true,
      // custom gradient colors for cloud cover
      gradient: {
        // enter n keys between 0 and 1 here
        // for gradient color customization
        '0': 'black',
        '1': 'white'
      },
      // if set to false the heatmap uses the global maximum for colorization
      // if activated: uses the data maximum within the current map boundaries
      //   (there will always be a red spot with useLocalExtremas true)
      useLocalExtrema: true,
      // which field name in your data represents the latitude - default "lat"
      latField: 'lat',
      // which field name in your data represents the longitude - default "lng"
      lngField: 'lng',
      // which field name in your data represents the data value - default "value"
      valueField: 'value'
    })
    map.addLayer(this.cloudCover)
    */
    this.wind = new WindLayer()
    map.addLayer(this.wind)

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
