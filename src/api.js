import apiHooks from './main.hooks'
import { weacast } from 'weacast-client'

let api = weacast()
// Setup app hooks
api.hooks(apiHooks)

api.users = api.getService('users')
api.forecasts = api.getService('forecasts')
api.probes = api.getService('probes')
api.probeResults = api.getService('probe-results')
api.alerts = api.getService('alerts')
// These services do some computations that might be long
api.probes.timeout = 30000
api.probeResults.timeout = 30000

export default api
