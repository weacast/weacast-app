import L from 'leaflet'
import 'leaflet-fullscreen'
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css'

import store from '../store'

let fullscreenMixin = {
  mounted () {
    let fullscreenControl = new L.Control.Fullscreen()
    this.controls.push(fullscreenControl)
  }
}

store.set('fullscreen', fullscreenMixin)

export default fullscreenMixin
