import createService from '../service'
import arpegePlugin from 'weacast-arpege'

module.exports = function() {
  const app = this

  const users = createService('users', app)
  const forecasts = createService('forecasts', app)

  // Set up our plugin services
  app.configure(arpegePlugin)
}
