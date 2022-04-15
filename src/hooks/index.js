import { log } from './logger'
import { emit } from './events'

let hooks = {
  log,
  emit
}

export default hooks
