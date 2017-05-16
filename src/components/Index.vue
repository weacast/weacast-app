<template>
  <q-layout>
    <div slot="header" class="toolbar">

      <button @click="$refs.menu.open()" v-show="authenticated">
        <i>menu</i>
        <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 20]">Menu</q-tooltip>
      </button>

      <q-toolbar-title :padding="0">Weacast</q-toolbar-title>

      <button class="primary" @click="goTo('signin')" v-show="!authenticated">
        Sign In
      </button>
      <button class="primary" @click="goTo('register')" v-show="!authenticated">
        Register
      </button>
      <button class="primary circular" @click="goTo('home')" v-show="authenticated">
        <i>home</i>
        <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 20]">Home</q-tooltip>
      </button>
      <button class="primary circular" @click="goTo('map')" v-show="authenticated">
        <i>layers</i>
        <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 20]">Map</q-tooltip>
      </button>
      <button @click="$refs.profile.open()" v-show="authenticated">
        <i>perm_identity</i>
        <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 20]">Profile</q-tooltip>
      </button>

    </div>

    <q-drawer swipe-only left-side ref="menu" v-show="authenticated">
      <div class="toolbar light">
        <i>menu</i>
        <q-toolbar-title :padding="1">
            Menu
        </q-toolbar-title>
      </div>

      <q-drawer-link icon="home" to="/home">Home</q-drawer-link>
      <q-drawer-link icon="layers" to="/map">Map</q-drawer-link>
      <q-collapsible icon="language" label="Model">
        <div class="list">
          <label v-for="forecast in forecasts" class="item two-lines">
            <div class="item-primary">
              <q-radio v-model="selectedForecast" :val="forecast"></q-radio>
            </div>
            <div class="item-content">
              <div>{{forecast.label}}</div>
              <div>{{forecast.description}}</div>
            </div>
          </label>
        </div>
      </q-collapsible>

      <q-collapsible icon="info" label="About">
        <p style="padding: 25px;" class="text-grey-7">
          Please read the <a href="https://weacast.gitbooks.io/weacast-docs/">Weacast Book</a>
        </p>
      </q-collapsible>
    </q-drawer>

    <q-drawer swipe-only right-side ref="profile" v-show="authenticated">
      <div class="toolbar light">
        <i>perm_identity</i>
        <q-toolbar-title :padding="1">
            Profile
        </q-toolbar-title>
      </div>

      <q-drawer-link icon="exit_to_app" to="/home" @click.native="signout">Sign Out</q-drawer-link>
    </q-drawer>

    <!-- sub-routes -->
    <router-view class="layout-view" :user="user" :forecastModel="selectedForecast"></router-view>
    
  </q-layout>
</template>

<script>
// Required by leaflet-velocity/timedimension, we make it availalbe as a global import
// because it must be present before other libs async load
import jQuery from 'jquery/dist/jquery.js'
window.$ = jQuery
window.jQuery = jQuery

import { Toast } from 'quasar'
import api from 'src/api'

export default {
  data () {
    return {
      user: null,
      forecasts: [],
      selectedForecast: null
    }
  },
  computed: {
    authenticated () {
      return this.$data.user !== null
    }
  },
  methods: {
    goTo (route) {
      this.$router.push({ name: route })
    },
    signout () {
      api.logout()
      .then(() => {
        Toast.create.positive('You are now logged out, sign in again to continue to work')
      })
      .catch(_ => {
        Toast.create.negative('Cannot logout, please check again in a few minutes')
      })
    },
    getUser (accessToken) {
      return api.passport.verifyJWT(accessToken)
      .then(payload => {
        return api.users.get(payload.userId)
      })
      .then(user => {
        this.$data.user = user
        return user
      })
    }
  },
  mounted () {
    // Check if there is already a session running
    api.authenticate()
    .then(user => {
      Toast.create.positive('Restoring previous session')
    })
    .catch(_ => {
      this.$router.push({ name: 'home' })
    })
    // On successfull login
    api.on('authenticated', response => {
      this.getUser(response.accessToken)
      .then(user => {
        this.$router.push({ name: 'home' })
        // Configure available forecast models
        api.forecasts.find()
        .then(response => {
          response.data.forEach(forecast => {
            forecast.elements.forEach(element => {
              // Declare element service
              api.getService(forecast.name + '/' + element.name)
            })
          })
          this.forecasts = response.data
        })
      })
    })
    // On logout
    api.on('logout', () => {
      this.$data.user = null
      this.$router.push({ name: 'home' })
    })
  },
  beforeDestroy () {
  }
}
</script>

<style lang="styl">

</style>
