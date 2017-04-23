module.exports = function(app, options) {
  options.db = app.db.collection('users')
  options.idField = '_id'
}
