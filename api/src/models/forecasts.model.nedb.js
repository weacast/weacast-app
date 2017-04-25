module.exports = function(app, options) {
  options.Model = app.db.collection('forecasts')
  //options.Model.ensureIndex({ fieldName: 'name', unique: true })
  options.id = 'name'
}
