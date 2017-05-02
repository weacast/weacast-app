import path from 'path'
import core, { createService } from 'weacast-core'
import arpege from 'weacast-arpege'

module.exports = function() {
  const app = this
  // Setup app services
  const users = createService('users', app, path.join(__dirname, '..', 'models'), path.join(__dirname, '..', 'services'))
  // Set up our plugin services
  app.configure(core)
  app.configure(arpege)
}
