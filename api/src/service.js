
export class Service {
  constructor(name, app) {
    const createService = require('feathers-' + app.db.adapter)
    const configureModel = require('./models/' + name + '.model.' + app.db.adapter)
    
    const paginate = app.get('paginate')
    const options = {
      name: name,
      paginate
    }
    configureModel(app, options)

    // Initialize our service with any options it requires
    app.use('/' + name, createService(options))

    // Get our initialized service so that we can register hooks and filters
    const service = app.service(name)

    const hooks = require('./services/'+ name + '/' + name + '.hooks')
    service.hooks(hooks)

    if (service.filter) {
      const filters = require('./services/' + name + '/' + name + '.filters')
      service.filter(filters)
    }
  }
}
