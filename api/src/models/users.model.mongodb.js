module.exports = function (app, options) {
  options.Model = app.db.collection('users')
  options.Model.ensureIndex({ email: 1 }, { unique: true })
}
