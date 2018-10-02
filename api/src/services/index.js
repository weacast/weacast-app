import path from 'path'
import fs from 'fs-extra'
import logger from 'winston'
import core, { initializeElements } from 'weacast-core'
import probe from 'weacast-probe'
// Setup if we use plugins
let arpege, arome, gfs
if (!process.env.USE_LOADER) {
  arpege = require('weacast-arpege')
  arome = require('weacast-arome')
  gfs = require('weacast-gfs')
}

module.exports = function () {
  const app = this
  // Setup app services
  let usersService = app.createService('users',
    path.join(__dirname, '..', 'models'),
    path.join(__dirname, '..', 'services'))
  // Set up our plugins/elements services
  try {
    app.configure(core)
    // Setup if we use loader
    if (process.env.USE_LOADER) {
      const forecasts = app.get('forecasts')
      // Iterate over configured forecast models
      for (let forecast of forecasts) {
        initializeElements(app, forecast)
      }
    } else { // Setup if we use plugins
      app.configure(arpege)
      app.configure(arome)
      app.configure(gfs) 
    }
    app.configure(probe)
  }
  catch (error) {
    logger.error(error.message)
  }

  let probesService = app.getService('probes')

  // Create default users if not already done
  const config = app.get('authentication')
  if (config) {
    let defaultUsers = config.defaultUsers
    if (defaultUsers) {
      usersService.find({
        paginate: false
      })
      .then(users => {
        defaultUsers.forEach(defaultUser => {
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
    }
  }
  // Create a default probe if not already done
  let defaultProbes = app.get('defaultProbes')
  if (defaultProbes) {
    probesService.find({
      paginate: false,
      query: {
        $select: ['name']
      }
    })
    .then(probes => {
      defaultProbes.forEach(defaultProbe => {
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
}
