import L from 'leaflet'

import store from '../store'

let scalebarMixin = {
  mounted () {
    let scalebarControl = L.control.scale()
    this.controls.push(scalebarControl)
  }
}

store.set('scalebar', scalebarMixin)

export default scalebarMixin
