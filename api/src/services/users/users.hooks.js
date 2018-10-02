const { hashPassword } = require('feathers-authentication-local').hooks
const commonHooks = require('feathers-hooks-common')
const gravatar = require('../../hooks/gravatar')
import { github, google, oidc, cognito } from '../../hooks/provider'

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [ github(), google(), oidc(), cognito(), hashPassword(), gravatar() ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [ commonHooks.when(hook => hook.params.provider, commonHooks.discard('password')) ],
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
