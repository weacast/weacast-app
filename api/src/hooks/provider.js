// Helper function used to extract profile infos
function processProfile(provider, user) {
  // A key is created for each provider in the user object
  if (user[provider] && user[provider].profile) {
      let profile = user[provider].profile
      // Some providers exposes a crude JSON obejct
      if (profile._json) profile = profile._json
      if (profile.emails && profile.emails.length > 0) {
        user.email = profile.emails[0].value
      }
     if (profile.email) {
        user.email = profile.email
      }
       if (profile.displayName) {
        user.name = profile.displayName
      }
      if (profile.name) {
        user.name = profile.displayName
      }
    }
}

export function github () {
  return function (hook) {
    processProfile('github', hook.data)
  }
}

export function google () {
  return function (hook) {
    processProfile('google', hook.data)
  }
}

export function oidc () {
  return function (hook) {
    processProfile('oidc', hook.data)
  }
}

