module.exports = function(app, options) {
  options.Model = app.db.collection('forecasts')
  options.Model.ensureIndex({ name: 1 }, { unique: true })
}
