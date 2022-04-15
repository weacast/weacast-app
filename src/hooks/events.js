// A hook that logs service method before, after and error
import EventBus from '../event-bus'

export function emit (hook) {
  EventBus.$emit(hook.type + 'Hook', hook)
}
