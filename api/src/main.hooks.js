// Application hooks that run for every service
import { hooks } from 'weacast-core'
import commonHooks from 'feathers-hooks-common'
const { authenticate } = require('feathers-authentication').hooks

module.exports = {
  before: {
    all: [ hooks.log,
      // We skip authentication in some cases
      commonHooks.when(hook => {
              // First built-in Feathers services like authentication
        if (!hook.service.name) return false
              // Then user creation
        if ((hook.service.name === 'users') && (hook.method === 'create')) return false
              // If not exception perform authentication
        return true
      }, authenticate('jwt')) ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [ hooks.log ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [ hooks.log ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
