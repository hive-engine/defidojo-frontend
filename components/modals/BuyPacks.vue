<template>
  <b-modal id="buyPacksModal" centered size="lg" title="Buy Packs">
    <b-row align-h="center">
      <b-col v-for="(pack, i) of settings.packs" :key="i" sm="6" class="mt-3">
        <div class="pack" :class="{selected: pack.symbol === symbol}" @click="symbol = pack.symbol">
          <img :src="pack.image" :alt="`${pack.symbol} Icon`">

          <div class="symbol">
            {{ pack.symbol }}
          </div>

          <div class="cards">
            {{ pack.cards }} cards inside
          </div>

          <div class="price">
            ${{ pack.price }}
          </div>

          <div class="available">
            Available {{ pack.remaining.toLocaleString() }} of {{ pack.quantity.toLocaleString() }}
          </div>
        </div>
      </b-col>
    </b-row>

    <b-form-spinbutton
      v-model="quantity"
      size="lg"
      :min="1"
      :max="2000"
      class="mx-auto mt-5 mb-3"
      style="width:200px;"
    />

    <div class="text-center font-italic text-uppercase">
      <template v-if="bonusQuantity > 0">
        + {{ bonusQuantity }} additional bonus packs
      </template>

      <template v-else>
        Select a Promo Amount to receive Bonus Packs!
      </template>
    </div>

    <div class="d-flex justify-content-around mt-3">
      <template v-for="(bonus,b) of settings.bonuses">
        <b-button
          :key="b"
          v-b-tooltip.hover.v-info
          :title="`+${bonus[1] * 100}% more Bonus Packs`"
          class="mt-1"
          variant="outline-info"
          size="sm"
          @click.prevent="quantity = bonus[0]"
        >
          {{ bonus[0] }} Packs
        </b-button>
      </template>
    </div>

    <h3 class="text-center font-style-italic mt-5">
      Total ${{ totalPayable }}
    </h3>

    <template #modal-footer>
      <div class="w-100">
        <template v-if="$auth.loggedIn">
          <b-row align-h="between">
            <b-col class="mt-3" cols="12" sm="4">
              <div id="paypal-checkout-button" />
            </b-col>

            <b-col class="mt-3" cols="12" sm="4">
              <b-input-group class="cryptoPay">
                <b-form-select
                  v-model="currency"
                  value-field="symbol"
                  text-field="name"
                  :options="currencies"
                />

                <b-input-group-append>
                  <b-button variant="primary" @click.prevent="startPurchaseWithCrypto">
                    <b-spinner v-if="modalBusy" small /> Pay
                  </b-button>
                </b-input-group-append>
              </b-input-group>
            </b-col>
          </b-row>
        </template>

        <template v-else>
          <div class="text-center">
            <p>Please login to purchase packs!</p>

            <b-button variant="primary" @click.prevent="$bvModal.show('loginModal')">
              Login
            </b-button>
          </div>
        </template>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'BuyPacksModal',

  data () {
    return {
      symbol: '',
      quantity: 1,

      currency: 'HIVE',

      modalBusy: false
    }
  },

  computed: {
    ...mapGetters(['settings']),

    currencies () {
      return this.settings.currencies.map(c => ({ ...c, name: `${c.name} (${c.symbol})` }))
    },

    totalPayable () {
      const pack = this.settings.packs.find(p => p.symbol === this.symbol)

      if (pack && pack.price) {
        return this.quantity * pack.price
      }

      return 0
    },

    paypalScript () {
      return `https://www.paypal.com/sdk/js?client-id=${this.settings.paypal_client_id}&disable-funding=credit`
    },

    bonusQuantity () {
      const bonus = this.settings.bonuses.reduce((acc, cur) => {
        if (this.quantity >= cur[0]) {
          acc = this.quantity * cur[1]
        }

        return acc
      }, 0)

      return this.toFixedWithoutRounding(bonus, 0)
    }
  },

  watch: {
    '$auth.loggedIn': {
      async handler (loggedIn) {
        if (loggedIn && process.client && window.paypal) {
          await this.sleep(2000)

          this.createPayPalButton()
        }
      }
    }
  },

  mounted () {
    this.$root.$on('bv::modal::show', this.onModalShow)
    this.$root.$on('bv::modal::shown', this.onModalShown)
    this.$root.$on('bv::modal::hidden', this.onModalHidden)
  },

  beforeDestroy () {
    this.$root.$off('bv::modal::show', this.onModalShow)
    this.$root.$off('bv::modal::shown', this.onModalShown)
    this.$root.$off('bv::modal::hidden', this.onModalHidden)
  },

  methods: {
    ...mapActions('pack', ['startPurchase', 'validatePayPalPayment']),

    onModalShow (btnEvent, modalId) {
      if (modalId === 'buyPacksModal') {
        this.symbol = this.settings.packs[0].symbol
        this.quantity = 1
        this.currency = 'HIVE'
        this.modalBusy = false
      }
    },

    async onModalShown (btnEvent, modalId) {
      if (modalId === 'buyPacksModal') {
        await this.loadPayPalScript()

        if (this.$auth.loggedIn) {
          this.createPayPalButton()
        }
      }
    },

    async onModalHidden (btnEvent, modalId) {
      if (modalId === 'buyPacksModal') {
        await this.unloadPayPalScript()
      }
    },

    async startPurchaseWithCrypto () {
      this.modalBusy = true

      try {
        await this.startPurchase({
          payment_method: 'crypto',
          currency: this.currency,
          items: [{ symbol: this.symbol, quantity: this.quantity }]
        })

        this.$bvModal.show('cryptoPaymentModal')
      } catch (e) {
        this.$notify({
          type: 'error',
          text: e.response.data.message || 'There was an error. Please try again later.',
          duration: 10000
        })
      }

      this.modalBusy = false
    },

    createPayPalButton () {
      const self = this

      try {
        window.paypal.Buttons({
          style: {
            layout: 'horizontal',
            height: 55,
            width: 200,
            shape: 'rect',
            size: 'responsive',
            tagline: false,
            display: 'paypal'
          },

          async createOrder (data, actions) {
            const purchaseInfo = await self.startPurchase({
              payment_method: 'paypal',
              items: [{ symbol: self.symbol, quantity: self.quantity }]
            })

            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [{
                reference_id: purchaseInfo.uid,
                invoice_id: purchaseInfo.uid,
                amount: {
                  value: purchaseInfo.payment.amount
                }
              }]
            })
          },

          onError (err) {
            console.error(err.message)
          },

          async onApprove (data, actions) {
            self.showLoadingOverlay()

            try {
              const capture = await actions.order.capture()

              self.$bvModal.hide('buyPacksModal')

              await self.validatePayPalPayment({ uid: capture.purchase_units[0].reference_id, tx: data.orderID })
            } catch (err) {
              console.log(err)
            }

            self.hideLoadingOverlay()
          }
        }).render('#paypal-checkout-button')
      } catch (e) {
        console.log(e.message)
      }
    },

    async loadPayPalScript () {
      try {
        await this.$loadScript(this.paypalScript)
      } catch {
        //
      }
    },

    async unloadPayPalScript () {
      try {
        await this.$unloadScript(this.paypalScript)
      } catch {
        //
      }
    }
  }
}
</script>

<style lang="scss">
.cryptoPay {
  height: 55px;

  .btn {
    width: 100px;
    text-transform: uppercase;
    font-weight: bold;

    @media screen and (min-width: 576px) {
      width: auto;
    }

    @media screen and (min-width: 992px) {
      width: 100px;
    }
  }

  .custom-select {
    height: 55px;
  }
}
</style>
