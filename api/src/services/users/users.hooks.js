const { authenticate } = require('feathers-authentication').hooks
const { hashPassword } = require('feathers-authentication-local').hooks
const commonHooks = require('feathers-hooks-common')
const gravatar = require('../../hooks/gravatar')
import { github, google } from '../../hooks/provider'

module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt') ],
    get: [ authenticate('jwt') ],
    create: [github(), google(), hashPassword(), gravatar()],
    update: [ authenticate('jwt') ],
    patch: [ authenticate('jwt') ],
    remove: [ authenticate('jwt') ]
  },

  after: {
    all: [commonHooks.when(hook => hook.params.provider, commonHooks.discard('password'))],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
