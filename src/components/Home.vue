<template>
  <div>
    <div class="layout-padding">
      <div>
        <div class="column items-center">
          <div class="auto"><img src="~assets/weacast-logo.png"></div>
          <div v-if="!authenticated"class="auto">
            <h3>
              </br>
              <router-link to="/signin">Sign In</router-link> or <router-link to="/register">Register</router-link>
            </h3>
          </div>
          <div v-else class="column items-center">
            <h5>
              This application is intended to be used by Airbus Test Flights to seek for runways matching specific wind conditions
              </br></br>
              This application can handle different forecast models, you can select the current one on the <a @click="openMenu">menu</a>
              </br></br>
              Go to the <router-link to="/map">map</router-link> to visualize wind forecast data and start finding runways
            </h5>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>

export default {
  props: ['user'],
  data () {
    return {
    }
  },
  computed: {
    authenticated () {
      return this.user !== null
    }
  },
  methods: {
    openMenu () {
      this.$parent.$parent.$refs.menu.open()
    },
    openProfile () {
      this.$parent.$parent.$refs.profile.open()
    }
  },
  mounted () {
  },
  beforeDestroy () {
  }
}
</script>

<style lang="styl">

</style>
