import L from 'leaflet'
import lodash from 'lodash'
import 'leaflet/dist/leaflet.css'
// This ensure we have all required plugins
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.js'
import 'leaflet-timedimension/dist/leaflet.timedimension.src.js'
import 'leaflet-timedimension/dist/leaflet.timedimension.control.css'
import store from '../store'

// Fix to make Leaflet assets be correctly inserted by webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

let baseMixin = {
  methods: {
    setupControls () {
      this.controls.forEach(control => control.addTo(this.map))
      this.$emit('controlsReady')
    },
    createLayer (layerConfiguration) {
      // Transform from string to actual objects when required in some of the layer options
      ['crs', 'rendererFactory'].forEach(option => {
        // Find the right argument holding the option
        let options = lodash.find(layerConfiguration.arguments, argument => typeof lodash.get(argument, option) === 'string')
        if (options) {
          // Jump from string to object, eg { crs: 'CRS.EPSGXXX' } will become { crs: L.CRS.EPSGXXX }
          lodash.set(options, option, lodash.get(L, lodash.get(options, option)))
        }
      })
      let type = layerConfiguration.type
      // Specific case of timedimension layer where we first need to create an underlying WMS layer
      if (layerConfiguration.type === 'timeDimension.layer.wms') {
        type = 'tileLayer.wms'
      }
      let layer = lodash.get(L, type)(...layerConfiguration.arguments)
      // Specific case of timedimension layer
      if (layerConfiguration.type === 'timeDimension.layer.wms') {
        return L.timeDimension.layer.wms(layer)
      } else {
        return layer
      }
    },
    setupOverlayLayers () {
      this.configuration.overlayLayers.forEach(overlayLayer => {
        this.overlaysLayers[overlayLayer.name] = this.createLayer(overlayLayer)
      })
    },
    center (longitude, latitude, zoomLevel) {
      this.map.setView(new L.LatLng(latitude, longitude), zoomLevel || 12)
    },
    removeLayer (layer) {
      if (!layer) return

      this.overlayLayersControl.removeLayer(layer)
      // If it was visible remove it from map
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer)
      }
      this.checkOverlayLayersControlVisibility()
    },
    addLayer (layer, name) {
      if (layer && !this.map.hasLayer(layer)) {
        // Check if layer is visible by default
        let visible = true
        if (layer.options.hasOwnProperty('visible')) {
          visible = layer.options.visible
        }
        if (visible) {
          this.map.addLayer(layer)
        }
        this.overlayLayersControl.addOverlay(layer, name)
        this.checkOverlayLayersControlVisibility()
      }
      return layer
    },
    checkOverlayLayersControlVisibility () {
      // Hidden while nothing has been loaded, default state
      this.overlayLayersControl.getContainer().style.visibility = 'hidden'
      this.overlayLayersControl._layers.forEach(_ => {
        // We know there is at least one layer to display
        this.overlayLayersControl.getContainer().style.visibility = 'visible'
      })
    }
  },
  created () {
    // This is the right place to declare private members because Vue has already processed observed data
    this.controls = []
    this.overlaysLayers = {}
  },
  mounted () {
    // Initialize the map now the DOM is ready
    this.map = L.map('map').setView([46, 1.5], 5)
    this.setupOverlayLayers()
    // Add basic overlays control
    this.overlayLayersControl = L.control.layers({}, this.overlaysLayers)
    this.controls.push(this.overlayLayersControl)
    this.$on('mapReady', _ => {
      this.setupControls()
      this.checkOverlayLayersControlVisibility()
    })
  },
  beforeDestroy () {
    this.map.remove()
  }
}

store.set('base', baseMixin)

export default baseMixin
