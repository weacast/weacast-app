import L from 'leaflet'
import 'leaflet-filelayer'

import store from '../store'

let fileLayersMixin = {
  mounted () {
    L.Control.FileLayerLoad.LABEL = '<i class="material-icons">file_upload</i>'
    let fileControl = L.Control.fileLayerLoad({
      // Allows you to use a customized version of L.geoJson.
      // For example if you are using the Proj4Leaflet leaflet plugin,
      // you can pass L.Proj.geoJson and load the files into the
      // L.Proj.GeoJson instead of the L.geoJson.
      layer: L.geoJson,
      // See http://leafletjs.com/reference.html#geojson-options
      layerOptions: this.getGeoJsonOptions(),
      // Add to map after loading (default: true) ?
      addToMap: false,
      // File size limit in kb (default: 1024) ?
      fileSizeLimit: this.configuration.fileSizeLimit || 1024 * 1024,
      // Restrict accepted file formats (default: .geojson, .kml, and .gpx) ?
      formats: [
        '.geojson',
        '.kml'
      ]
    })
    this.controls.push(fileControl)
    this.$on('controlsReady', _ => {
      fileControl.loader.on('data:loaded', event => {
        // Remove any previous layer
        this.removeLayer(this.fileLayer)
        // Keep track of layer
        this.fileLayer = this.addLayer(event.layer, event.filename)
        this.$emit('fileLayerLoaded', this.fileLayer, event.filename)
      })
    })
  }
}

store.set('fileLayers', fileLayersMixin)

export default fileLayersMixin
