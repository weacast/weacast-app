import logger from 'loglevel'
import feathers from '@feathersjs/client'
import io from 'socket.io-client'
import config from 'config'
import apiHooks from './main.hooks'

function weacast () {
  let api = feathers()
  // Setup log level
  if (config.logs && config.logs.level) {
    logger.setLevel(config.logs.level, false)
  } else {
    logger.setLevel('info')
  }
  const origin = config.apiUrl || window.location.origin
  if (config.transport === 'http') {
    api.configure(feathers.rest(origin).fetch(window.fetch.bind(window)))
  } else {
    let socket = io(origin, {
      transports: ['websocket'],
      path: config.apiPath + 'ws'
    })
    api.configure(feathers.socketio(socket, { timeout: config.apiTimeout || 30000 }))
  }
  api.configure(feathers.authentication({
    storage: window.localStorage,
    cookie: config.apiJwt || 'weacast-jwt',
    storageKey: config.apiJwt || 'weacast-jwt',
    path: config.apiPath + '/authentication'
  }))

  // This avoid managing the API path before each service name
  api.getService = function (path) {
    return api.service(config.apiPath + '/' + path)
  }

  return api
}

let api = weacast()
// Setup app hooks
api.hooks(apiHooks)

api.users = api.getService('users')
api.forecasts = api.getService('forecasts')
api.probes = api.getService('probes')
api.probeResults = api.getService('probe-results')
api.alerts = api.getService('alerts')
// These services do some computations that might be long
api.probes.timeout = 30000
api.probeResults.timeout = 30000

export default api
