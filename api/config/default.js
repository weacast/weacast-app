var path = require('path')
var containerized = require('containerized')()
var clientConfig = require('../../config')

var API_PREFIX = '/api'

module.exports = {
  client: clientConfig,

  // Proxy your API if using any.
  // Also see /build/script.dev.js and search for "proxy api requests"
  // https://github.com/chimurai/http-proxy-middleware
  proxyTable: {},

  host: 'localhost',
  port: process.env.PORT || 8081,
  /* To enable HTTPS
  https: {
    key: path.join(__dirname, 'server.key'),
    cert: path.join(__dirname, 'server.crt'),
    port: process.env.HTTPS_PORT || 8084
  },
  */

  apiPath: API_PREFIX,

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
    path: API_PREFIX + '/authentication',
    service: API_PREFIX + '/users',
    defaultUsers: [
      {
        email: 'weacast@weacast.xyz',
        password: 'weacast'
      }
    ],
    github: {
      clientID: '20da06587907b8048edb',
      clientSecret: '22029773f71829af8eaba6c0d6599843026cbf15',
      callbackURL: (process.env.NODE_ENV === 'development' ? 'http://localhost:' + clientConfig.dev.port + '/auth/github/callback' : '/auth/github/callback'),
      successRedirect: (process.env.NODE_ENV === 'development' ? 'http://localhost:' + clientConfig.dev.port + '/' : '/')
    },
    google: {
      clientID: '879164794322-ed4nl0j3sdsr00bjbrsqdcskon1k7go4.apps.googleusercontent.com',
      clientSecret: 'mZZejuVZ4_oG9WpoGPXTJKFe',
      callbackURL: (process.env.NODE_ENV === 'development' ? 'http://localhost:' + clientConfig.dev.port + '/auth/google/callback' : '/auth/google/callback'),
      successRedirect: (process.env.NODE_ENV === 'development' ? 'http://localhost:' + clientConfig.dev.port + '/' : '/'),
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
    },
    // Required for OAuth2 to work correctly
    cookie: {
      enabled: true,
      name: 'feathers-jwt',
      httpOnly: false,
      secure: false
    }
  },
  logs: {
    Console: {
      colorize: true,
      level: (process.env.NODE_ENV === 'development' ? 'verbose' : 'info')
    },
    DailyRotateFile: {
      dirname: path.join(__dirname, '..', 'logs'),
      filename: 'weacast-',
      datePattern: 'yyyy-MM-dd.log',
      maxDays: 5
      /* Possible in next version of the logger : see https://github.com/winstonjs/winston-daily-rotate-file/pull/45
      filename: path.join(__dirname, '..', 'logs'),
      datePattern: '/yyyy/MM/dd.log',
      createTree: true
      */
    }
  },
  db: {
    adapter: 'mongodb',
    path: path.join(__dirname, '..', 'db-data'),
    url: process.env.DB_URL || (containerized ? 'mongodb://mongodb:27017/weacast' : 'mongodb://127.0.0.1:27017/weacast')
  },
  probePath: path.join(__dirname, '..', 'probe-data'),
  defaultProbes: [
    {
      fileName: 'ne_10m_airports.geojson'
    }
  ],
  forecastPath: path.join(__dirname, '..', 'forecast-data'),
  forecasts: [
    /*
    {
      name: 'gfs-world-low',
      label: 'GFS - 1°',
      description: 'World-wide',
      attribution: 'Forecast data from <a href="http://www.emc.ncep.noaa.gov/index.php?branch=GFS">NCEP</a>',
      model: 'gfs',
      baseUrl: 'http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl',
      bounds: [0, -90, 360, 90],
      origin: [0, 90],
      size: [360, 181],
      resolution: [1, 1],
      runInterval: 6 * 3600,          // Produced every 6h
      oldestRunInterval: 24 * 3600,   // Don't go back in time older than 1 day
      interval: 3 * 3600,             // Steps of 3h
      lowerLimit: 0,                  // From T0
      upperLimit: 240 * 3600,         // Up to T0+240
      updateInterval: 15 * 60,        // Check for update every 15 minutes
      elements: [
        {
          name: 'u-wind',
          variable: 'var_UGRD',
          levels: ['lev_10_m_above_ground']
        },
        {
          name: 'v-wind',
          variable: 'var_VGRD',
          levels: ['lev_10_m_above_ground']
        },
        {
          name: 'gust',
          variable: 'var_GUST',
          levels: ['surface']
        }
      ]
    },
    */
    {
      name: 'gfs-world',
      label: 'GFS - 0.5°',
      description: 'World-wide',
      attribution: 'Forecast data from <a href="http://www.emc.ncep.noaa.gov/index.php?branch=GFS">NCEP</a>',
      model: 'gfs',
      baseUrl: 'http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p50.pl',
      bounds: [0, -90, 360, 90],
      origin: [0, 90],
      size: [720, 361],
      resolution: [0.5, 0.5],
      runInterval: 6 * 3600,          // Produced every 6h
      oldestRunInterval: 24 * 3600,   // Don't go back in time older than 1 day
      interval: 3 * 3600,             // Steps of 3h
      lowerLimit: 0,                  // From T0
      upperLimit: 240 * 3600,         // Up to T0+240
      updateInterval: 15 * 60,        // Check for update every 15 minutes
      elements: [
        {
          name: 'u-wind',
          variable: 'var_UGRD',
          levels: ['lev_10_m_above_ground']
        },
        {
          name: 'v-wind',
          variable: 'var_VGRD',
          levels: ['lev_10_m_above_ground']
        },
        {
          name: 'gust',
          variable: 'var_GUST',
          levels: ['surface']
        }
      ]
    },
    /*
    {
      name: 'gfs-world-high',
      label: 'GFS - 0.25°',
      description: 'World-wide',
      attribution: 'Forecast data from <a href="http://www.emc.ncep.noaa.gov/index.php?branch=GFS">NCEP</a>',
      model: 'gfs',
      baseUrl: 'http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl',
      bounds: [0, -90, 360, 90],
      origin: [0, 90],
      size: [1440, 721],
      resolution: [0.25, 0.25],
      runInterval: 6 * 3600,          // Produced every 6h
      oldestRunInterval: 24 * 3600,   // Don't go back in time older than 1 day
      interval: 1 * 3600,             // Steps of 1h
      lowerLimit: 0,                  // From T0
      upperLimit: 16 * 3600,          // Up to T0+16
      updateInterval: 15 * 60,        // Check for update every 15 minutes
      elements: [
        {
          name: 'u-wind',
          variable: 'var_UGRD',
          levels: ['lev_10_m_above_ground']
        },
        {
          name: 'v-wind',
          variable: 'var_VGRD',
          levels: ['lev_10_m_above_ground']
        },
        {
          name: 'gust',
          variable: 'var_GUST',
          levels: ['surface']
        }
      ]
    },
    */
    {
      name: 'arpege-world',
      label: 'ARPEGE - 0.5°',
      description: 'World-wide',
      model: 'arpege',
      token: '__qEMDoIC2ogPRlSoRQLGUBOomaxJyxdEd__',
      wcsBaseUrl: 'https://geoservices.meteofrance.fr/services/MF-NWP-GLOBAL-ARPEGE-05-GLOBE-WCS?SERVICE=WCS&version=2.0.1',
      bounds: [-180, -90, 180, 90],
      origin: [-180, 90],
      size: [720, 361],
      resolution: [0.5, 0.5],
      runInterval: 6 * 3600,          // Produced every 6h
      oldestRunInterval: 24 * 3600,   // Don't go back in time older than 1 day
      interval: 3 * 3600,             // Steps of 3h
      lowerLimit: 0,                  // From T0
      upperLimit: 102 * 3600,         // Up to T0+102
      updateInterval: 15 * 60,        // Check for update every 15 minutes
      elements: [
        {
          name: 'u-wind',
          // Use 'db' (or remove this property as it is default) to store data directly as JSON object in DB instead of files
          //dataStore: 'fs',
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
        },
        {
          name: 'gust',
          coverageid: 'WIND_SPEED_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
          subsets: {
            height: 10
          }
        }
      ]
    },
    /*
    {
      name: 'arpege-europe',
      isDefault: true,
      label: 'ARPEGE - 0.1°',
      description: 'Europe',
      attribution: 'Forecast data from <a href="http://www.meteofrance.com">Météo-France</a>',
      model: 'arpege',
      token: '__qEMDoIC2ogPRlSoRQLGUBOomaxJyxdEd__',
      wcsBaseUrl: 'https://geoservices.meteofrance.fr/services/MF-NWP-GLOBAL-ARPEGE-01-EUROPE-WCS?SERVICE=WCS&version=2.0.1',
      bounds: [-32, 20, 42, 72],
      origin: [-32, 72],
      size: [741, 521],
      resolution: [0.1, 0.1],
      runInterval: 6 * 3600,            // Produced every 6h
      oldestRunInterval: 24 * 3600,     // Don't go back in time older than 1 day
      interval: 1 * 3600,               // Steps of 1h
      lowerLimit: 0,                    // From T0
      upperLimit: 102 * 3600,           // Up to T0+102
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
        },
        {
          name: 'gust',
          coverageid: 'WIND_SPEED_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
          subsets: {
            height: 10
          }
        }
        // {
        //   name: 'temperature',
        //   coverageid: 'TEMPERATURE__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        //   subsets: {
        //     height: 2
        //   }
        // }
      ]
    },
    */
    /*
    {
      name: 'arome-france',
      label: 'AROME - 0.025°',
      description: 'France',
      model: 'arome',
      token: '__qEMDoIC2ogPRlSoRQLGUBOomaxJyxdEd__',
      wcsBaseUrl: 'https://geoservices.meteofrance.fr/services/MF-NWP-HIGHRES-AROME-0025-FRANCE-WCS?SERVICE=WCS&version=2.0.1',
      bounds: [-8, 38, 12, 53],
      origin: [-8, 53],
      size: [801, 601],
      resolution: [0.025, 0.025],
      runInterval: 3 * 3600,            // Produced every 3h
      oldestRunInterval: 24 * 3600,     // Don't go back in time older than 1 day
      interval: 1 * 3600,               // Steps of 1h
      lowerLimit: 0,                    // From T0
      upperLimit: 42 * 3600,            // Up to T0+42
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
        },
        {
          name: 'gust',
          coverageid: 'WIND_SPEED_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
          subsets: {
            height: 10
          }
        }
        // {
        //   name: 'temperature',
        //   coverageid: 'TEMPERATURE__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        //   subsets: {
        //     height: 2
        //   }
        // }
      ]
    }
    */
    // This model generates too much data to be stored in MongoDB documents (limited to 16 MB)
    // It requires the use of the 'gridfs' data store
    /*
    ,
    {
      name: 'arome-france-high',
      label: 'AROME - 0.01°',
      description: 'France',
      model: 'arome',
      token: '__qEMDoIC2ogPRlSoRQLGUBOomaxJyxdEd__',
      wcsBaseUrl: 'https://geoservices.meteofrance.fr/services/MF-NWP-HIGHRES-AROME-001-FRANCE-WCS?SERVICE=WCS&version=2.0.1',
      bounds: [-12, 37.5, 16, 55.4],
      origin: [-12, 55.4],
      size: [2801, 1791],
      resolution: 0.01,
      runInterval: 3 * 3600,            // Produced every 3h
      oldestRunInterval: 24 * 3600,     // Don't go back in time older than 1 day
      interval: 1 * 3600,               // Steps of 1h
      lowerLimit: 0,                    // From T0
      upperLimit: 42 * 3600,            // Up to T0+42
      updateInterval: 15 * 60,          // Check for update every 15 minutes
      elements: [
        {
          name: 'u-wind',
          dataStore: 'gridfs',
          coverageid: 'U_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
          subsets: {
            height: 10
          }
        },
        {
          name: 'v-wind',
          dataStore: 'gridfs',
          coverageid: 'V_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
          subsets: {
            height: 10
          }
        }
      ]
    }
    */
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
