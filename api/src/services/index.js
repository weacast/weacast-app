import path from 'path'
import fs from 'fs-extra'
import logger from 'winston'
import core from 'weacast-core'
import arpege from 'weacast-arpege'
import arome from 'weacast-arome'
import gfs from 'weacast-gfs'
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
    app.configure(gfs)
    app.configure(probe)
  }
  catch (error) {
    logger.error(error.message)
  }

  let probesService = app.getService('probes')

  // Create default users if not already done
  usersService.find({
    paginate: false
  })
  .then(users => {
    app.get('authentication').defaultUsers.forEach(defaultUser => {
      let createdUser = users.find(user => user.email === defaultUser.email)
      if (!createdUser) {
        logger.info('Initializing default user (email = ' + defaultUser.email + ', password = ' + defaultUser.password + ')')
        usersService.create({
          email: defaultUser.email,
          password: defaultUser.password
        })
      }
    })
  })
  // Create a default probe if not already done
  probesService.find({
    paginate: false,
    query: {
      $select: ['name']
    }
  })
  .then(probes => {
    app.get('defaultProbes').forEach(defaultProbe => {
      const probeName = path.parse(defaultProbe.fileName).name
      let createdProbe = probes.find(probe => probe.name === probeName)
      if (!createdProbe) {
        // One probe for each forecast model and elements
        for (let forecast of app.get('forecasts')) {
          logger.info('Initializing default probe ' + defaultProbe.fileName + ' for forecast model ' + forecast.name)
          let geojson = fs.readJsonSync(path.join(app.get('probePath'), defaultProbe.fileName))
          let options = Object.assign({
            name: probeName,
            forecast: forecast.name,
            elements: forecast.elements.map(element => element.name)
          }, defaultProbe.options)
          Object.assign(geojson, options)
          probesService.create(geojson)
          .then(probe => {
            logger.info('Initialized default probe ' + defaultProbe.fileName + ' for forecast model ' + forecast.name)
          })
        }
      }
    })
  })
}
