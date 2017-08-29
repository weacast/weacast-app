var path = require('path')

module.exports = {
  // Webpack aliases
  aliases: {
    quasar: path.resolve(__dirname, '../node_modules/quasar-framework/'),
    src: path.resolve(__dirname, '../src'),
    assets: path.resolve(__dirname, '../src/assets'),
    components: path.resolve(__dirname, '../src/components'),
    config: path.resolve(__dirname, './client-config.json')
  },

  // Progress Bar Webpack plugin format
  // https://github.com/clessg/progress-bar-webpack-plugin#options
  progressFormat: ' [:bar] ' + ':percent'.bold + ' (:msg)',

  // Default theme to build with ('ios' or 'mat')
  defaultTheme: 'mat',

  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    publicPath: '',
    productionSourceMap: false,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css']
  },
  dev: {
    env: require('./dev.env'),
    cssSourceMap: true,
    // auto open browser or not
    openBrowser: true,
    publicPath: '/',
    port: process.env.PORT || 8080,
    /* To enable HTTPS
    https: {
      key: path.join(__dirname, 'server.key'),
      cert: path.join(__dirname, 'server.crt'),
      port: process.env.HTTPS_PORT || 8083
    },
    */

    // If for example you are using Quasar Play
    // to generate a QR code then on each dev (re)compilation
    // you need to avoid clearing out the console, so set this
    // to "false", otherwise you can set it to "true" to always
    // have only the messages regarding your last (re)compilation.
    clearConsoleOnRebuild: false,

    // Proxy your API if using any.
    // Also see /build/script.dev.js and search for "proxy api requests"
    // https://github.com/chimurai/http-proxy-middleware
    // Does not work well to manage API path with feathers, notably on WS
    proxyTable: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        logLevel: 'debug'
      },
      '/apiws': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        ws: true,
        logLevel: 'debug'
      },
      // The auth endpoints are not easy to prefix so we manage it manually
      '/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        logLevel: 'debug'
      }
    }
  }
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
