<template>
  <div>
    <div class="layout-padding">
      <div v-if="!authenticated">
        <div class="column items-center">
          <div class="auto"><img src="~assets/weacast-logo.png"></div>
          <div class="auto">
            <h3>
              </br>
              <router-link to="/signin">Sign In</router-link> or <router-link to="/register">Register</router-link> to see the power of Weacast
              </br></br>
            </h3>
          </div>
        </div>
      </div>
      <div v-else class="column items-center">
        <h5>
          To make your profile more sexy first register your avatar to <a href="https://www.gravatar.com">https://www.gravatar.com</a>
        </h5>
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
  },
  mounted () {
  },
  beforeDestroy () {
  }
}
</script>

<style lang="styl">

</style>
