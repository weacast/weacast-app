export function github () {
  return function (hook) {
    if (hook.data.github && hook.data.github.profile) {
      const profile = hook.data.github.profile
      if (profile.emails && profile.emails.length > 0) {
        hook.data.email = profile.emails[0].value
      }
      if (profile.displayName) {
        hook.data.name = profile.displayName
      }
    }
  }
}

export function google () {
  return function (hook) {
    if (hook.data.google && hook.data.google.profile) {
      const profile = hook.data.google.profile
      if (profile.emails && profile.emails.length > 0) {
        hook.data.email = profile.emails[0].value
      }
      if (profile.displayName) {
        hook.data.name = profile.displayName
      }
    }
  }
}
