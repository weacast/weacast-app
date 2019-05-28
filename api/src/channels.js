import _ from 'lodash'

export default function (app) {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return
  }

  app.on('connection', connection => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('anonymous').join(connection)
  })

  app.on('login', (authResult, { connection }) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if (connection) {
      // Obtain the logged in user from the connection
      // const user = connection.user;

      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection)

      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection)
    }
  })

  app.publish((data, hook) => {
    // Do not raise events for tiles
    if (_.has(data, 'x') && _.has(data, 'y') && _.has(data, 'geometry')) return
    // We do not dispatch real-time events on probe results as we might have a lot of them
    // Not really required anymore as we use internal bulk writes for performance reasons,
    // however custom code might generate results ?
    if (_.get(hook, 'service.name') === 'probe-results') return
    // Publish service events to authenticated users only
    return app.channel('authenticated')
  })
}
