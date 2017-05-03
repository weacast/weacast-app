var path = require('path')
var clientConfig = require('../../config')

module.exports = {
  client: clientConfig,

  // Proxy your API if using any.
  // Also see /build/script.dev.js and search for "proxy api requests"
  // https://github.com/chimurai/http-proxy-middleware
  proxyTable: {},

  port: process.env.PORT || 8081,

  apiPath: '/api',

  host: 'localhost',
  paginate: {
    default: 10,
    max: 50
  },
  authentication: {
    secret: 'b5KqXTye4fVxhGFpwMVZRO3R56wS5LNoJHifwgGOFkB5GfMWvIdrWyQxEJXswhAC',
    strategies: [
      'jwt',
      'local'
    ],
    path: '/authentication',
    service: 'users'
  },
  db: {
    adapter: 'mongodb',
    path: path.join(__dirname, '../db-data'),
    url: 'mongodb://localhost:27018/weacast'
  },
  forecastPath: path.join(__dirname, '../forecast-data'),
  forecasts: [
    {
      name: 'arpege-world',
      model: 'arpege',
      token: '__qEMDoIC2ogPRlSoRQLGUBOomaxJyxdEd__',
      wcsBaseUrl: 'https://geoservices.meteofrance.fr/services/MF-NWP-GLOBAL-ARPEGE-05-GLOBE-WCS?SERVICE=WCS&version=2.0.1',
      resolution: 0.5,
      runInterval: 6 * 3600,          // Produced every 6h
      oldestRunInterval: 24 * 3600,   // Don't go back in time older than 1 day
      interval: 3 * 3600,             // Steps of 3h
      limit: 102 * 3600,              // Up to T0+102
      updateInterval: 15 * 60,        // Check for update every 15 minutes
      elements: [
        {
          name: 'u-wind',
          coverageid: 'U_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
          subsets: {
            height: 10
          }
        },
        {
          name: 'v-wind',
          coverageid: 'V_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
          subsets: {
            height: 10
          }
        }
      ]
    },
    {
      name: 'arpege-europe',
      model: 'arpege',
      token: '__qEMDoIC2ogPRlSoRQLGUBOomaxJyxdEd__',
      wcsBaseUrl: 'https://geoservices.meteofrance.fr/services/MF-NWP-GLOBAL-ARPEGE-01-EUROPE-WCS?SERVICE=WCS&version=2.0.1',
      resolution: 0.1,
      runInterval: 6 * 3600,            // Produced every 6h
      oldestRunInterval: 24 * 3600,     // Don't go back in time older than 1 day
      interval: 1 * 3600,               // Steps of 1h
      limit: 102 * 3600,                // Up to T0+102
      updateInterval: 15 * 60,          // Check for update every 15 minutes
      elements: [
        {
          name: 'u-wind',
          coverageid: 'U_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
          subsets: {
            height: 10
          }
        },
        {
          name: 'v-wind',
          coverageid: 'V_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
          subsets: {
            height: 10
          }
        }
      ]
    },
    {
      name: 'arome-france-low',
      model: 'arome',
      token: '__qEMDoIC2ogPRlSoRQLGUBOomaxJyxdEd__',
      wcsBaseUrl: 'https://geoservices.meteofrance.fr/services/MF-NWP-HIGHRES-AROME-0025-FRANCE-WCS?SERVICE=WCS&version=2.0.1',
      resolution: 0.025,
      runInterval: 3 * 3600,            // Produced every 3h
      oldestRunInterval: 24 * 3600,     // Don't go back in time older than 1 day
      interval: 1 * 3600,               // Steps of 1h
      limit: 42 * 3600,                 // Up to T0+42
      updateInterval: 15 * 60,          // Check for update every 15 minutes
      elements: [
        {
          name: 'u-wind',
          coverageid: 'U_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
          subsets: {
            height: 10
          }
        },
        {
          name: 'v-wind',
          coverageid: 'V_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
          subsets: {
            height: 10
          }
        }
      ]
    },
    {
      name: 'arome-france-high',
      model: 'arome',
      token: '__qEMDoIC2ogPRlSoRQLGUBOomaxJyxdEd__',
      wcsBaseUrl: 'https://geoservices.meteofrance.fr/services/MF-NWP-HIGHRES-AROME-001-FRANCE-WCS?SERVICE=WCS&version=2.0.1',
      resolution: 0.025,
      runInterval: 3 * 3600,            // Produced every 3h
      oldestRunInterval: 24 * 3600,     // Don't go back in time older than 1 day
      interval: 1 * 3600,               // Steps of 1h
      limit: 42 * 3600,                 // Up to T0+42
      updateInterval: 15 * 60,          // Check for update every 15 minutes
      elements: [
        {
          name: 'u-wind',
          coverageid: 'U_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
          subsets: {
            height: 10
          }
        },
        {
          name: 'v-wind',
          coverageid: 'V_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
          subsets: {
            height: 10
          }
        }
      ]
    }
  ]
}

/*
 * proxyTable example:
 *
   proxyTable: {
      // proxy all requests starting with /api
      '/api': {
        target: 'https://some.address.com/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
 */
