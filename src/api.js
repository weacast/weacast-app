import feathers from 'feathers-client'
import hooks from 'feathers-hooks'
import io from 'socket.io-client'
const socket = io('http://localhost:8081', {transports: ['websocket']})

const api = feathers()
  .configure(hooks())
  // .configure(feathers.rest('http://localhost:8080'))
  .configure(feathers.socketio(socket))
  .configure(feathers.authentication({ storage: window.localStorage }))

export default api
