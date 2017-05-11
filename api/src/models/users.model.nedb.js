module.exports = function (app, options) {
  options.Model = app.db.collection('users')
  options.Model.ensureIndex({ fieldName: 'email', unique: true })
}
