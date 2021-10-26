<template>
  <div class="app">
    <page-header />

    <nuxt />

    <activity />
    <buy-packs />
    <crypto-payment />
    <payment-success />
    <payment-error />
    <login />
    <notifications :duration="10000" />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import Activity from '@/components/modals/Activity.vue'
import BuyPacks from '@/components/modals/BuyPacks.vue'
import CryptoPayment from '~/components/modals/CryptoPayment.vue'
import PageHeader from '@/components/Header.vue'
import PaymentSuccess from '@/components/modals/PaymentSuccess.vue'
import PaymentError from '@/components/modals/PaymentError.vue'
import Login from '@/components/modals/Login.vue'
import NFTMixin from '@/mixins/nft'

export default {
  name: 'DefaultLayout',

  components: {
    Activity,
    BuyPacks,
    CryptoPayment,
    PageHeader,
    PaymentSuccess,
    PaymentError,
    Login
  },

  mixins: [NFTMixin],

  methods: {
    ...mapActions(['fetchSettings'])
  },

  timers: {
    fetchSettings: { time: 60 * 1000, autostart: true, repeat: true }
  }
}
</script>

<style>

</style>
