// A hook that logs service method before, after and error
import logger from 'loglevel'

export function log (hook) {
  let message = `${hook.type}: ${hook.path} - Method: ${hook.method}`

  if (hook.type === 'error') {
    message += `: ${hook.error.message}`
  }

  logger.debug(message)
  if (hook.error) {
    logger.error(hook.error)
  }

  if (hook.data) {
    logger.trace(hook.data)
  }
  if (hook.params) {
    logger.trace(hook.params)
  }
  if (hook.result) {
    logger.trace(hook.result)
  }
}
