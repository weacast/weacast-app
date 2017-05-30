export function loadComponent (component) {
  return System.import(`components/${component}.vue`)
}

export function loadComponentForRoute (component) {
  return () => System.import(`components/${component}.vue`)
}
