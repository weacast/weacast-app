const path = require('path')
const proxyMiddleware = require('http-proxy-middleware')

const feathers = require('feathers')
const middleware = require('./middleware')
const services = require('./services')
const appHooks = require('./main.hooks')

import { weacast } from 'weacast-core'

export class Server {
  constructor () {
    this.app = weacast()
    // Serve pure static assets
    if (process.env.NODE_ENV === 'production') {
      this.app.use(this.app.get('client').build.publicPath, feathers.static('../dist'))
    }
    else {
      const staticsPath = path.posix.join(this.app.get('client').dev.publicPath, 'statics/')
      this.app.use(staticsPath, feathers.static('../dist/statics'))
    }

    // Define HTTP proxies to your custom API backend. See /config/index.js -> proxyTable
    // https://github.com/chimurai/http-proxy-middleware
    Object.keys(this.app.get('proxyTable')).forEach(context => {
      let options = this.config.this.app.get('proxyTable')[context]
      if (typeof options === 'string') {
        options = { target: options }
      }
      this.app.use(proxyMiddleware(context, options))
    })
  }

  async run () {
    // First try to connect to DB
    await this.app.db.connect()

    const port = this.app.get('port')

    // Set up our services (see `services/index.js`)
    this.app.configure(services)
    // Configure middleware (see `middleware/index.js`) - always has to be last
    this.app.configure(middleware)
    this.app.hooks(appHooks)

    // Last lauch server
    await this.app.listen(port)
  }
}
