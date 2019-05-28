const express = require('@feathersjs/express')

module.exports = function () {
  // Add your custom middleware here. Remember, that
  // in Express the order matters, `notFound` and
  // the error handler have to go last.
  const app = this

  app.use(express.notFound())
  app.use(express.errorHandler())
}
