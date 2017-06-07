<template>
  <!-- Don't drop "q-app" class -->
  <div id="q-app">
    <q-ajax-bar ref="bar" position="bottom" size="8" color="primary"></q-ajax-bar>
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
  mounted () {
    EventBus.$on('errorHook', hook => {
      Toast.create.negative(hook.error.message)
    })
  }
}
</script>

<style></style>
