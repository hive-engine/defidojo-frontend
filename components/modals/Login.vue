<template>
  <div class="login">
    <b-modal id="loginModal" title="Login" centered>
      <div class="px-5 pt-3 pb-2 text-center">
        <b-form-group label="Hive Username" label-sr-only>
          <b-form-input v-model="username" trim placeholder="Hive username" @input="username = $event.toLowerCase()" />
        </b-form-group>

        <b-button block variant="primary" @click.prevent="requestLogin">
          Login with Keychain
        </b-button>

        <p class="mt-3 mb-0 small">
          <a target="_blank" href="https://hive-keychain.com">Download Hive Keychain for Browsers and Mobile</a>
        </p>
      </div>

      <template #modal-footer>
        <div class="w-100 px-5 py-3">
          <b-button block @click.prevent="$bvModal.show('smartLock')">
            Login with SmartLock
          </b-button>
        </div>
      </template>
    </b-modal>

    <smart-lock :callback="smartLockLogin" :key-types="['active']" />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import SmartLock from '@/components/modals/SmartLock.vue'

export default {
  name: 'LoginModal',

  components: {
    SmartLock
  },

  data () {
    return {
      username: ''
    }
  },

  mounted () {
    this.$root.$on('smartlock-loggedin', () => {
      this.$root.$bvModal.hide('loginModal')
    })
  },

  methods: {
    ...mapActions('user', ['loginWithKeychain', 'loginWithKey']),

    requestLogin () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.loginWithKeychain(this.username)
      }
    },

    async smartLockLogin (username, wif) {
      const data = {
        username,
        wif
      }

      await this.loginWithKey(data)
    }
  },

  validations: {
    username: {
      required,
      validUsername: (value) => {
        if (value === '') { return true }

        return /^[a-z][a-z0-9-.]{2,15}$/.test(value)
      }
    }
  }
}
</script>

<style>

</style>
