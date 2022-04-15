// Application hooks that run for every service
import hooks from './hooks'

export default {
  before: {
    all: [ hooks.log, hooks.emit ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [ hooks.log, hooks.emit ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [ hooks.log, hooks.emit ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
