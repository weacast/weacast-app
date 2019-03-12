var path = require('path')
var containerized = require('containerized')()
const forecasts = require('./forecasts')

var API_PREFIX = '/api'
const serverPort = process.env.PORT || process.env.HTTPS_PORT || 8081
// Required to know webpack port so that in dev we can build correct URLs
const clientPort = process.env.CLIENT_PORT || process.env.HTTPS_CLIENT_PORT || 8080
let domain
// If we build a specific staging instance
if (process.env.VIRTUAL_HOST) {
  domain = 'http://' + process.env.VIRTUAL_HOST
} else {
  if (process.env.NODE_ENV === 'development') {
    domain = 'http://localhost:' + clientPort
  } else {
    domain = 'http://localhost:' + serverPort
  }
}
// Override defaults if env provided
if (process.env.SUBDOMAIN) {
  domain = 'https://weacast.' + process.env.SUBDOMAIN
}

module.exports = {
  // Proxy your API if using any.
  // Also see /build/script.dev.js and search for "proxy api requests"
  // https://github.com/chimurai/http-proxy-middleware
  proxyTable: {},
  domain,
  host: process.env.HOSTNAME || 'localhost',
  port: serverPort,
  /* To enable HTTPS
  https: {
    key: path.join(__dirname, 'server.key'),
    cert: path.join(__dirname, 'server.crt'),
    port: process.env.HTTPS_PORT || 8084
  },
  */
  apiPath: API_PREFIX,
  apiOnly: process.env.API_ONLY,
  paginate: {
    default: 10,
    max: 50
  },
  authentication: {
    secret: process.env.APP_SECRET || 'b5KqXTye4fVxhGFpwMVZRO3R56wS5LNoJHifwgGOFkB5GfMWvIdrWyQxEJXswhAC',
    strategies: [
      'jwt',
      'local'
    ],
    path: API_PREFIX + '/authentication',
    service: API_PREFIX + '/users',
    jwt: {
      header: { typ: 'access' }, // See https://tools.ietf.org/html/rfc7519#section-5.1
      audience: process.env.SUBDOMAIN || 'kalisio', // The resource server where the token is processed
      issuer: 'kalisio', // The issuing server, application or resource
      algorithm: 'HS256', // See https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
      expiresIn: '1d'
    },
    defaultUsers: [
      {
        email: 'weacast@weacast.xyz',
        password: 'weacast'
      }
    ],
    github: {
      clientID: process.env.GITHUB_CLIENT_ID || '20da06587907b8048edb',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '22029773f71829af8eaba6c0d6599843026cbf15',
      callbackURL: domain + '/auth/github/callback',
      successRedirect: domain + '/'
    },
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID || '879164794322-ed4nl0j3sdsr00bjbrsqdcskon1k7go4.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mZZejuVZ4_oG9WpoGPXTJKFe',
      callbackURL: domain + '/auth/google/callback',
      successRedirect: domain + '/',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
    },
    cognito: {
      clientID: '1vmieaua4phmqr4tt0v664aqq5',
      clientSecret: 'kp5v6511tsn1tss6mka3chnekaifs6aemt9un2sg3m2ja2veuoa',
      clientDomain: 'https://weacast.auth.eu-west-1.amazoncognito.com',
      callbackURL: domain + '/auth/cognito/callback',
      successRedirect: domain + '/',
      region: 'eu-west-1'
    },
    // Required for OAuth2 to work correctly
    cookie: {
      enabled: true,
      name: 'weacast-jwt',
      httpOnly: false,
      secure: (process.env.NODE_ENV === 'development' ? false : true)
    }
  },
  logs: {
    Console: {
      colorize: true,
      level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : (process.env.NODE_ENV === 'development' ? 'verbose' : 'info')
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
  sync: process.env.USE_LOADER ? { url: process.env.SYNC_DB_URL || process.env.DB_URL } : false,
  defaultProbes: [
    {
      fileName: path.join(__dirname, '..', 'probe-data', 'ne_10m_airports.geojson'),
      options: {
        featureId: 'properties.iata_code'
      }
    }
  ],
  defaultAlerts: [
    {
      fileName: path.join(__dirname, '..', 'probe-data', 'paris.geojson'),
      options: {
        cron: '0 */1 * * * *', // Every minute
        expireAt: new Date(Date.now() + 99 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 99 years validity
        featureId: 'properties.iata_code',
        period: {
          start: { hours: 0 },
          end: { hours: 24 }
        },
        elements: [ 'windSpeed' ],
        conditions: {
          windSpeed: { $gte: 0 } // Set a large range so that we are sure it will trigger
        }
      }
    }
  ],
  forecastPath: path.join(__dirname, '..', 'forecast-data'),
  forecasts: [ forecasts.gfs05, forecasts.arpege05 ]
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
