import feathers from 'feathers-client'
import hooks from 'feathers-hooks'
import io from 'socket.io-client'
import config from 'config'

let api = feathers()
  .configure(hooks())
  .configure(feathers.authentication({
    storage: window.localStorage,
    path: config.apiPath + '/authentication'
  }))

// This avoid managing the API path before each service name
api.getService = function (path) {
  return api.service(config.apiPath + '/' + path)
}

if (config.transport === 'web-socket') {
  let socket = io(window.location.origin, {
    transports: ['websocket'],
    path: config.apiPath + 'ws'
  })
  api.configure(feathers.socketio(socket))
}
else {
  api.configure(feathers.rest(window.location.origin).fetch(window.fetch.bind(window)))
}

api.users = api.getService('users')
api.forecasts = api.getService('forecasts')

export default api
