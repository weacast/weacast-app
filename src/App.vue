<template>
  <!-- Don't drop "q-app" class -->
  <div id="q-app">
    <q-ajax-bar ref="bar" position="bottom" size="8px" color="#027be3" :delay="250"></q-ajax-bar>
    <router-view></router-view>
  </div>
</template>

<script>
import { Toast } from 'quasar'
import { EventBus } from 'weacast-client'

/*
 * Root component
 */
export default {
  methods: {
    startProgress () {
      let progressBar = this.$refs.bar
      if (progressBar && !progressBar.active && (this.nbRequests > this.nbCompletedRequests)) {
        progressBar.start()
      }
    },
    stopProgress () {
      let progressBar = this.$refs.bar
      if (progressBar && progressBar.active && (this.nbRequests <= this.nbCompletedRequests)) {
        progressBar.stop()
      }
    }
  },
  beforeCreate () {
    // Request counter used to display progress bar
    this.nbRequests = 0
    this.nbCompletedRequests = 0
  },
  mounted () {
    EventBus.$on('errorHook', hook => {
      Toast.create.negative(hook.error.message)
      this.nbCompletedRequests++
      this.stopProgress()
    })
    EventBus.$on('beforeHook', hook => {
      this.nbRequests++
      this.startProgress()
    })
    EventBus.$on('afterHook', hook => {
      this.nbCompletedRequests++
      this.stopProgress()
    })
  }
}
</script>

<style></style>
