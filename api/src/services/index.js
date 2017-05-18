import path from 'path'
import logger from 'winston'
import core from 'weacast-core'
import arpege from 'weacast-arpege'
import arome from 'weacast-arome'
import probe from 'weacast-probe'

module.exports = function () {
  const app = this
  // Setup app services
  app.createService('users', path.join(__dirname, '..', 'models'), path.join(__dirname, '..', 'services'))
  // Set up our plugin services
  try {
    app.configure(core)
    app.configure(arpege)
    app.configure(arome)
    app.configure(probe)
  }
  catch (error) {
    logger.error(error.message)
  }
}
