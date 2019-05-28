const fs = require('fs-extra')
const https = require('https')
const proxyMiddleware = require('http-proxy-middleware')

const express = require('@feathersjs/express')
const middlewares = require('./middlewares')
const services = require('./services')
const hooks = require('./hooks')
const channels = require('./channels')

import logger from 'winston'
import { weacast } from 'weacast-core'

export class Server {
  constructor () {
    this.app = weacast()
    // Server API only or also client app ?
    const apiOnly = this.app.get('apiOnly')
    if (!apiOnly) {
      // Serve pure static assets
      if (process.env.NODE_ENV === 'production') {
        this.app.use('/', express.static('../dist'))
      }
    }

    // Define HTTP proxies to your custom API backend. See /config/index.js -> proxyTable
    // https://github.com/chimurai/http-proxy-middleware
    const proxyTable = this.app.get('proxyTable') || {}
    Object.keys(proxyTable).forEach(context => {
      let options = proxyTable[context]
      if (typeof options === 'string') {
        options = { target: options }
      }
      this.app.use(proxyMiddleware(context, options))
    })
  }

  async run () {
    let app = this.app
    // First try to connect to DB
    await app.db.connect()
    // Set up our services
    await app.configure(services)
    // Register hooks
    app.hooks(hooks)
    // Set up real-time event channels
    app.configure(channels)
    // Configure middlewares - always has to be last
    app.configure(middlewares)
    
    // Last lauch server
    const httpsConfig = app.get('https')
    if (httpsConfig) {
      const port = httpsConfig.port
      let server = https.createServer({
        key: fs.readFileSync(httpsConfig.key),
        cert: fs.readFileSync(httpsConfig.cert)
      }, app)
      logger.info('Configuring HTTPS server at port ' + port.toString())
      await server.listen(port)
    } else {
      const port = app.get('port')
      logger.info('Configuring HTTP server at port ' + port.toString())
      await app.listen(port)
    }
  }
}
