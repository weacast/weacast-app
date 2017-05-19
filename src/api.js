import { weacast } from 'weacast-client'

let api = weacast()

api.users = api.getService('users')
api.forecasts = api.getService('forecasts')
api.probes = api.getService('probes')
api.probeResults = api.getService('probe-results')
// This service does some computations that might be long
api.probes.timeout = 10000

export default api
