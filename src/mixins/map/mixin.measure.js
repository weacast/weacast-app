import L from 'leaflet'
import 'leaflet-measure/dist/leaflet-measure.js'
import 'leaflet-measure/dist/leaflet-measure.css'

import store from '../store'

let measureMixin = {
  mounted () {
    let measureControl = new L.Control.Measure({ position: 'topright' })
    this.controls.push(measureControl)
  }
}

store.set('measure', measureMixin)

export default measureMixin
