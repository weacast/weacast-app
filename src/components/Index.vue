<template>
  <q-layout>
    <div slot="header" class="toolbar">

      <button @click="$refs.menu.open()" v-show="authenticated">
        <i>menu</i>
        <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 20]">Menu</q-tooltip>
      </button>

      <q-toolbar-title :padding="0">{{appName}}</q-toolbar-title>

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
      <q-collapsible opened icon="language" label="Model">
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
          Please read the <a href="https://weacast.github.io/weacast-docs/">Weacast docs</a>
        </p>
      </q-collapsible>
    </q-drawer>

    <q-drawer swipe-only right-side ref="profile" v-show="authenticated">
      <div class="toolbar light">
        <i v-if="!hasAvatar">perm_identity</i>
        <img v-if="hasAvatar" :src="user.avatar" style="border-radius:50%" width="32px" height="32px">
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

import { Toast } from 'quasar'
import api from 'src/api'
import config from 'config'

export default {
  data () {
    return {
      appName: 'Weacast',
      user: null,
      forecasts: [],
      selectedForecast: null
    }
  },
  computed: {
    authenticated () {
      return this.user !== null
    },
    hasAvatar () {
      return this.authenticated && this.user.avatar
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
    }
  },
  created () {
    // Apply app name if given
    if (config.appName) this.appName = config.appName
  },
  mounted () {
    // Check if there is already a session running
    api.authenticate()
    .then(user => {
      Toast.create.positive('Restoring previous session')
    })
    .catch(error => {
      // This ensure an old token cannot be kept
      api.logout()
      this.$router.push({ name: 'home' })
      // Rethrow for caller to handle
      throw error
    })
    // On successfull login
    api.on('authenticated', response => {
      if (response.users) {
        this.user = response.users
      } else {
        this.signout()
      }
      if (this.user) {
        // If no route, otherwise keep it so that links work out-of-the-box
        if (this.$route.path === '/') {
          this.$router.push({ name: 'home' })
        }
        // Configure available forecast models
        api.forecasts.find()
        .then(response => {
          response.data.forEach(forecast => {
            forecast.elements.forEach(element => {
              // Declare element service
              let elementService = api.getService(forecast.name + '/' + element.name)
              // These services do some computations that might be long
              elementService.timeout = 30000
            })
          })
          this.forecasts = response.data
          // Select default if any or first one
          this.selectedForecast = this.forecasts.find(forecast => forecast.isDefault)
          if (!this.selectedForecast) {
            this.selectedForecast = (this.forecasts.length > 0 ? this.forecasts[0] : null)
          }
        })
      }
    })
    // On logout
    api.on('logout', () => {
      this.user = null
      this.$router.push({ name: 'home' })
    })
  },
  beforeDestroy () {
  }
}
</script>

<style lang="styl">

</style>
