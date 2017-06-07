export function loadComponent (component) {
  return () => System.import(`components/${component}.vue`)
}
