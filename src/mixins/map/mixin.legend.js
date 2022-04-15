import math from 'mathjs'
import L from 'leaflet'
import 'leaflet-legend/leaflet-legend.js'
import 'leaflet-legend/leaflet-legend.css'
import store from '../store'

// Add knot unit not defined by default
math.createUnit('knot', { definition: '0.514444 m/s', aliases: ['knots', 'kt', 'kts'] })

let legendMixin = {
  methods: {
    getLabelsForUnit (colorMap, units) {
      let labels = ['<span style="text-align:center; width: 30px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; background: white">' + units.from + '</span> ']
      for (var i = 0; i < colorMap.length; i++) {
        labels.push('<span style="text-align:center; width: 30px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; background:' +
          colorMap[i].color + '">' + math.unit(colorMap[i].value, units.base).toNumber(units.from).toFixed(0) + '</span> ')
      }
      return labels
    },
    getHtmlForUnit (colorMap, units) {
      let labelsForUnit = this.getLabelsForUnit(colorMap, units)
      if (units.from !== units.to) return '<div title="Click to convert to ' + units.to + '" style="position:absolute; cursor:pointer;">' + labelsForUnit.join('<br>') + '</div>'
      else return '<div style="position:absolute; cursor:pointer;">' + labelsForUnit.join('<br>') + '</div>'
    },
    setLegendColorMap (legend, forecastLayer, colorMap) {
      const units = forecastLayer.options.units
      if (!units || (units.length === 0)) return
      // Offset to avoid stacking multiple legends
      let offsetHtml = '<div style="transform: translateX(' + legend.offset + 'px)">'
      // The first unit is the base one
      const base = units[0]
      // Build legend/labels for each unit
      let html = []
      units.forEach((from, index) => {
        let to = units[(index + 1) % units.length]
        html.push(offsetHtml + this.getHtmlForUnit(colorMap, { base, from, to }) + '</div>')
      })
      let currentUnitIndex = 0
      legend._container.innerHTML = html[currentUnitIndex]
      legend._container.addEventListener('click', _ => {
        currentUnitIndex = (currentUnitIndex + 1) % html.length
        legend._container.innerHTML = html[currentUnitIndex]
      })
    },
    showLegend (forecastLayer) {
      let legend = this.legends[forecastLayer._leaflet_id]
      legend.addTo(this.map)
      let colorMap = forecastLayer.getColorMap()
      // Nothing to display ?
      if (colorMap.length === 0) {
        this.hideLegend(forecastLayer)
      } else {
        this.setLegendColorMap(legend, forecastLayer, colorMap)
      }
      forecastLayer.off('data', legend.callback)
    },
    hideLegend (forecastLayer) {
      let legend = this.legends[forecastLayer._leaflet_id]
      delete this.legends[forecastLayer._leaflet_id]
      legend.remove()
    }
  },
  mounted () {
    this.legends = {}
    this.map.on('layeradd', event => {
      const forecastLayer = event.layer
      // We only manage forecast layers
      if (forecastLayer instanceof L.Weacast.ForecastLayer) {
        const count = Object.keys(this.legends).length
        let legend = new L.Control.Legend({ position: 'topleft', collapsed: false })
        legend.offset = count * 40
        legend.callback = () => this.showLegend(forecastLayer)
        this.legends[forecastLayer._leaflet_id] = legend
        // We need to wait until data is here because it is require to get color map
        if (forecastLayer.hasData) this.showLegend(forecastLayer)
        else forecastLayer.on('data', legend.callback)
      }
    })
    this.map.on('layerremove', event => {
      const forecastLayer = event.layer
      if (this.legends[forecastLayer._leaflet_id]) {
        this.hideLegend(forecastLayer)
      }
    })
  }
}

store.set('legend', legendMixin)

export default legendMixin
