import L from 'leaflet'
import store from '../store'

let geojsonLayersMixin = {
  methods: {
    addGeoJson (geojson, name, geojsonOptions) {
      return this.addLayer(L.geoJson(geojson, Object.assign(this.getGeoJsonOptions(), geojsonOptions)), name)
    },
    addGeoJsonCluster (geojson, name, geojsonOptions) {
      let cluster = L.markerClusterGroup()
      cluster.addLayer(L.geoJson(geojson, geojsonOptions || this.getGeoJsonOptions()))
      return this.addLayer(cluster, name)
    },
    addTimedGeoJson (geojson, name, timeOptions, geojsonOptions) {
      return this.addLayer(L.timeDimension.layer.geoJson(L.geoJson(geojson, Object.assign(this.getGeoJsonOptions(), geojsonOptions)), timeOptions), name)
    },
    createMarkerFromStyle (latlng, markerStyle) {
      if (markerStyle) {
        let icon = markerStyle.icon
        // Parse icon options to get icon object if any
        if (icon) {
          icon = L[icon.type](icon.options)
          return L[markerStyle.type](latlng, { icon })
        } else {
          return L[markerStyle.type](latlng, markerStyle.options)
        }
      } else {
        return L.marker(latlng)
      }
    },
    getGeoJsonOptions () {
      function htmlForProperties (feature, properties) {
        const borderStyle = ' style="border: 1px solid black; border-collapse: collapse;"'
        let html = '<table' + borderStyle + '>'
        html += '<tr' + borderStyle + '><th' + borderStyle + '><pre> Property </pre></th><th><pre>  Value  </pre></th></tr>'
        html += properties.map(k => {
          let kHtml = '<tr style="border: 1px solid black; border-collapse: collapse;"><th' + borderStyle + '>' + k + '</th><th>'
          // Unify to array
          let values = feature.properties[k]
          if (!Array.isArray(values)) values = [values]
          for (let i = 0; i < values.length; i++) {
            const value = values[i]
            if (Number.isFinite(value)) kHtml += value.toFixed(2)
            else kHtml += value
            if (i < (values.length - 1)) kHtml += '<br/>'
          }
          kHtml += '</th></tr>'
          return kHtml
        })
        .join('')
        return html + '</table>'
      }
      let geojsonOptions = {
        onEachFeature: (feature, layer) => {
          const featureStyle = this.configuration.featureStyle
          // Custom defined function in component ?
          if (typeof this.getFeaturePopup === 'function') {
            layer.bindPopup(this.getFeaturePopup(feature, layer))
          } else if (feature.properties) {
            // Default content
            let properties = Object.keys(feature.properties)
            // Custom list given ?
            if (featureStyle && featureStyle.popup) {
              if (featureStyle.popup.properties) {
                properties = featureStyle.popup.properties
              }
              if (featureStyle.popup.excludedProperties) {
                properties = properties.filter(property => !featureStyle.popup.excludedProperties.includes(property))
              }
            }
            const html = htmlForProperties(feature, properties.filter(k => feature.properties[k] !== null && feature.properties[k] !== undefined))
            // Configured or default style
            if (featureStyle && featureStyle.popup && featureStyle.popup.options) {
              layer.bindPopup(html, featureStyle.popup.options)
            } else {
              layer.bindPopup(html, {
                maxHeight: 400,
                maxWidth: 600
              })
            }
          }
          // Custom defined function in component ?
          if (typeof this.getFeatureTooltip === 'function') {
            layer.bindTooltip(this.getFeatureTooltip(feature, layer))
          } else if (featureStyle && featureStyle.tooltip && featureStyle.tooltip.property && feature.properties) {
            let tooltip = feature.properties[featureStyle.tooltip.property]
            if (tooltip) {
              layer.bindTooltip(tooltip, featureStyle.tooltip.options || { permanent: true })
            }
          }
        },
        style: (feature) => {
          // Custom defined function in component ?
          if (typeof this.getFeatureStyle === 'function') {
            return this.getFeatureStyle(feature)
          } else {
            // Configured or default style
            return this.configuration.featureStyle || {
              opacity: 1,
              radius: 6,
              color: 'red',
              fillOpacity: 0.5,
              fillColor: 'green'
            }
          }
        },
        pointToLayer: (feature, latlng) => {
          // Custom defined function in component ?
          if (typeof this.getPointMarker === 'function') {
            return this.getPointMarker(feature, latlng)
          } else {
            // Configured or default style
            return this.createMarkerFromStyle(latlng, this.configuration.pointStyle)
          }
        }
      }

      return geojsonOptions
    }
  }
}

store.set('geojsonLayers', geojsonLayersMixin)

export default geojsonLayersMixin
