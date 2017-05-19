// A hook that logs service method before, after and error
const logger = require('winston')

module.exports = function () {
  return function (hook) {
    let message = `${hook.type}: ${hook.path} - Method: ${hook.method}`

    if (hook.type === 'error') {
      message += `: ${hook.error.message}`
    }

    logger.verbose(message)
    if (hook.error) {
      logger.error(hook.error)
    }
    
    logger.debug('hook.data', hook.data)
    logger.debug('hook.params', hook.params)

    if (hook.result) {
      logger.debug('hook.result', hook.result)
    }
  }
}
