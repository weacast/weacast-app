import path from 'path'
import fs from 'fs-extra'
import logger from 'winston'
import core from 'weacast-core'
import arpege from 'weacast-arpege'
import arome from 'weacast-arome'
import probe from 'weacast-probe'

module.exports = function () {
  const app = this
  // Setup app services
  let usersService = app.createService('users', path.join(__dirname, '..', 'models'), path.join(__dirname, '..', 'services'))
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

  let probesService = app.getService('probes')

  // Create a default user if not already done
  usersService.find({ paginate: false })
  .then(users => {
    if (users.length === 0) {
      logger.info('Initializing default user (email = weacast@weacast.org, password = weacast)')
      usersService.create({
        email: 'weacast@weacast.org',
        password: 'weacast'
      })
    }
  })
  // Create a default probe if not already done
  probesService.find({ paginate: false })
  .then(async probes => {
    if (probes.length === 0) {
      let geojson = fs.readJsonSync(path.join(__dirname, '..', '..', 'data', 'ne_10m_airports.geojson'))
      // One probe for each forecast model and elements
      for (let forecast of app.get('forecasts')) {
        logger.info('Initializing default probe for forecast model ' + forecast.name)
        Object.assign(geojson, {
          forecast: forecast.name,
          elements: forecast.elements.map(element => element.name)
        })
        await probesService.create(geojson)
      }
    }
  })
}
