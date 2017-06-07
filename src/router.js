import Vue from 'vue'
import VueRouter from 'vue-router'
import { loadComponent } from './utils'

Vue.use(VueRouter)

export default new VueRouter({
  /*
   * NOTE! VueRouter "history" mode DOESN'T works for Cordova builds,
   * it is only to be used only for websites.
   *
   * If you decide to go with "history" mode, please also open /config/index.js
   * and set "build.publicPath" to something other than an empty string.
   * Example: '/' instead of current ''
   *
   * If switching back to default "hash" mode, don't forget to set the
   * build publicPath back to '' so Cordova builds work again.
   */

  routes: [
    {
      path: '/',
      component: loadComponent('Index'),
      children: [
        {
          path: '/home',
          name: 'home',
          component: loadComponent('Home')
        },
        {
          path: '/signin',
          name: 'signin',
          component: loadComponent('SignIn')
        },
        {
          path: '/register',
          name: 'register',
          component: loadComponent('SignIn')
        },
        {
          path: '/map',
          name: 'map',
          component: loadComponent('Map')
        }
      ]
    },
    {
      path: '*',
      component: loadComponent('Error404')
    } // Not found
  ]
})
