module.exports = {
  appName: 'XWind',
  transport: 'http',
  map: {
    seeker: 'RunwaySeeker',
    mixins: [ 'base', 'baseLayers', 'forecastLayers', 'geojsonLayers', 'fullscreen', 'measure', 'scalebar' ],
    forecastLayers: [
      {
        type: 'FlowLayer',
        name: 'Wind',
        options: {
          elements: ['u-wind', 'v-wind'],
          attribution: 'Forecast data from <a href="http://www.meteofrance.com">Météo-France</a>',
          lineWidth: 2,
          frameRate: 20,
          particleMultiplier: 1 / 900,
          displayOptions: {
            velocityType: 'Wind',
            position: 'bottomright',
            emptyString: 'No wind data',
            angleConvention: 'bearingCW',
            speedUnit: 'kt'
          }
        }
      }
    ],
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
        excludedProperties: ['time']
      }
    }
  }
}
