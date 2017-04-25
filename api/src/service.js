const path = require('path')

export default function createService (name, app) {
  const createService = require('feathers-' + app.db.adapter)
  const configureModel = require(path.join(__dirname, 'models/' + name + '.model.' + app.db.adapter))
  
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

  const hooks = require(path.join(__dirname, 'services/'+ name + '/' + name + '.hooks'))
  service.hooks(hooks)

  if (service.filter) {
    const filters = require(path.join(__dirname, '/services/' + name + '/' + name + '.filters'))
    service.filter(filters)
  }

  return service
}
