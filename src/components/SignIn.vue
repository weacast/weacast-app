<template>
</template>

<script>
import { Toast, Dialog } from 'quasar'
import api from 'src/api'
import config from 'config'

// import { API } from 'src/api'

export default {
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    isRegistration () {
      return this.$route.name === 'register'
    },
    register (email, password) {
      return api.users.create({
        email: email,
        password: password
      })
    },
    login (email, password) {
      return api.authenticate({
        strategy: 'local',
        email: email,
        password: password
      })
    }
  },
  mounted () {
    const title = this.isRegistration() ? 'Register' : 'Sign In'
    // Local auth is always here
    let buttons = [
      {
        label: 'Ok',
        handler: (data) => {
          if (this.isRegistration()) {
            this.register(data.email, data.password)
            .then(() => {
              return this.login(data.email, data.password)
            })
            .then(_ => {
              Toast.create.positive('You are now logged in')
              this.$router.push({ name: 'home' })
            })
            .catch(_ => {
              Toast.create.negative('Cannot register, please check your e-mail or password')
              this.$router.push({ name: 'home' })
            })
          } else {
            this.login(data.email, data.password)
            .then(_ => {
              Toast.create.positive('You are now logged in')
              this.$router.push({ name: 'home' })
            })
            .catch(_ => {
              Toast.create.negative('Cannot sign in, please check your e-mail or password')
              this.$router.push({ name: 'home' })
            })
          }
        }
      }
    ]
    // Then add auth providers if any
    if (config.login && config.login.providers) {
      config.login.providers.forEach(provider => {
        buttons.push({
          label: provider,
          handler: (data) => {
            location.href = '/oauth/' + provider.toLowerCase()
          }
        })
      })
    }

    Dialog.create({
      title,
      form: {
        email: {
          type: 'textbox',
          label: 'E-mail',
          model: ''
        },
        password: {
          type: 'password',
          label: 'Password',
          model: ''
        }
      },
      onDismiss: () => {
        this.$router.push({ name: 'home' })
      },
      buttons
    })
  },
  beforeDestroy () {
  }
}
</script>

<style lang="styl">

</style>
