module.exports = {
  apiPath: '/api',
  transport: 'web-socket', // Could be 'http' or 'web-socket',
  appName: 'Weacast',
  logs: {
    level: (process.env.NODE_ENV === 'development' ? 'debug' : 'info')
  },
  map: {
    seeker: 'WindSeeker',
    mixins: [ 'base', 'baseLayers', 'forecastLayers', 'geojsonLayers', 'fileLayers', 'fullscreen', 'measure', 'scalebar' ],
    baseLayers: [
      {
        type: 'tileLayer',
        arguments: [
          'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
          {
            maxZoom: 20,
            label: 'Streets',
            attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          }
        ]
      },
      {
        type: 'tileLayer',
        arguments: [
          'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png',
          {
            maxZoom: 20,
            label: 'Satellite',
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, ' +
                        'AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          }
        ]
      },
      {
        type: 'tileLayer',
        arguments: [
          'http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png',
          {
            maxZoom: 20,
            label: 'Neutral',
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, ' +
                         'NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
          }
        ]
      }
    ],
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
            angleConvention: 'meteoCW',
            speedUnit: 'm/s'
          }
        }
      }/*,
      {
        type: 'HeatLayer',
        name: 'Gust',
        options: {
          elements: ['gust'],
          attribution: 'Forecast data from <a href="http://www.meteofrance.com">Météo-France</a>',
        }
      }*/
    ],
    // Default GeoJSON layer style for polygons/lines
    featureStyle: {
      opacity: 1,
      radius: 6,
      color: 'red',
      fillOpacity: 0.5,
      fillColor: 'green',
      popup: {
        excludedProperties: ['wikipedia']
      }
    },
    // Default GeoJSON layer style for points
    pointStyle: {
      type: 'circleMarker',
      options: {
        opacity: 1,
        color: 'red',
        fillOpacity: 0.5,
        fillColor: 'green'
      }
    }
  }
}
