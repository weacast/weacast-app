<template>
  <div>
    <div class="layout-padding">
      <div>
        <div class="column items-center">
          <div class="auto"><img src="~assets/weacast-logo.png"></div>
          <div v-if="!authenticated"class="auto">
            <h3>
              </br>
              <router-link to="/signin">Sign In</router-link> or <router-link to="/register">Register</router-link> to see the power of Weacast
            </h3>
            <p>*Default demo account login is <a>weacast@weacast.xyz</a> with <a>weacast</a> password</p>
          </div>
          <div v-else class="column items-center">
            <h5>
              To make your <a @click="openProfile">profile</a> more sexy first register your avatar to <a href="https://www.gravatar.com">https://www.gravatar.com</a>
              </br></br>
              This demo aims at showing the capability to handle different forecast models, you can select the current one on the <a @click="openMenu">menu</a>
              </br></br>
              Then go to the <router-link to="/map">map</router-link> to visualize and probe forecast data
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
