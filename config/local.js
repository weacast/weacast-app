module.exports = {
  appName: 'Runway seeker',
  map: {
    seeker: 'RunwaySeeker',
    mixins: [ 'base', 'baseLayers', 'forecastLayers', 'geojsonLayers', 'fullscreen', 'measure', 'scalebar' ],
    // Default GeoJSON layer style for polygons/lines
    featureStyle: {
      opacity: 1,
      radius: 6,
      color: 'red',
      fillOpacity: 0.5,
      fillColor: 'green',
      tooltip: {
        property: 'Ident'
      },
      popup: {
        //properties: ['Ident']
      }
    }
  }
}
