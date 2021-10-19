import Vue from 'vue'
import PincodeInput from 'vue-pincode-input'
import Loading from '@/components/Loading.vue'

if (!Vue.__myGlobalMixin__) {
  Vue.__myGlobalMixin__ = true

  Vue.mixin({
    components: {
      Loading,
      PincodeInput
    },

    data () {
      return {
        loading: false
      }
    },

    methods: {
      showLoadingOverlay () {
        if (process.client) {
          this.loader = this.$loading.show({
            container: null,
            canCancel: false,
            loader: 'bars',
            backgroundColor: '#000',
            color: 'crimson',
            width: 100,
            height: 100
          })
        }
      },

      hideLoadingOverlay () {
        if (process.client && this.loader) {
          this.loader.hide()
        }
      },

      scrollToTop (top = 0) {
        if (!process.client) { return }

        window.scroll({
          top,
          left: 0,
          behavior: 'smooth'
        })
      },

      sleep (ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
      },

      toFixedWithoutRounding (t, l = 3) {
        const a = 10 ** l
        const s = t * a
        return Math.trunc(s) / a
      }
    }
  })
}
