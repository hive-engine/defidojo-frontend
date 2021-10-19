<template>
  <b-modal id="cryptoPaymentModal" size="lg" centered title="Pay with Crypto" hide-footer>
    <template #default="{close}">
      <b-container fluid>
        <template v-if="purchase_data && purchase_data.payment_info">
          <template v-if="purchase_data.payment_info.type === 'hive' || purchase_data.payment_info.type === 'hive-engine'">
            <dl>
              <dt>Total {{ purchase_data.payment_info.currency }}</dt>

              <dd>
                {{ purchase_data.payment_info.amount }}
                {{ purchase_data.payment_info.currency }}
              </dd>

              <dt>Account</dt>
              <dd>{{ purchase_data.payment_info.address }}</dd>

              <dt>MEMO</dt>
              <dd>{{ purchase_data.uid }}</dd>
            </dl>

            <div class="text-center mt-5">
              <b-button variant="info" class="payment-btn" @click.prevent="requestCryptoPayment">
                <template v-if="$auth.user.smartlock">
                  <v-icon name="lock" class="text-danger" /> Pay with SmartLock
                </template>

                <template v-else>
                  <img src="icons/hive_keychain.png">&nbsp; Pay with Keychain
                </template>
              </b-button>
            </div>
          </template>

          <template v-else>
            <b-row>
              <b-col cols="8">
                <dl>
                  <dt>Total {{ purchase_data.payment_info.currency }}</dt>

                  <dd>
                    <code>{{ purchase_data.payment_info.amount }}
                      {{ purchase_data.payment_info.currency }}</code> <a href="#" class="small" @click.prevent="copyText(purchase_data.payment_info.amount)">Copy</a>
                  </dd>

                  <dt>Address</dt>
                  <dd><code>{{ purchase_data.payment_info.address }}</code> <a href="#" class="small" @click.prevent="copyText(purchase_data.payment_info.address)">Copy</a></dd>

                  <template v-if="purchase_data.payment_info.memo">
                    <dt>Memo/Tag</dt>
                    <dd><code>{{ purchase_data.payment_info.memo }}</code> <a href="#" class="small" @click.prevent="copyText(purchase_data.payment_info.memo)">Copy</a></dd>
                  </template>
                </dl>
              </b-col>

              <b-col cols="4">
                <p class="font-weight-bold">
                  QR Code
                </p>
                <img class="img-fluid" :src="purchase_data.payment_info.qrcode_url" alt="QR Code">
              </b-col>
            </b-row>

            <p class="text-muted text-center">
              We will verify the payment in the background and issue the packs upon successful payment verification.
            </p>

            <div class="text-center mt-3">
              <b-button
                variant="danger"
                class="payment-btn"
                @click="close"
              >
                Cancel
              </b-button>

              <b-button
                variant="info"
                class="payment-btn"
                @click="paymentMade"
              >
                Payment Sent
              </b-button>
            </div>
          </template>
        </template>
      </b-container>
    </template>
  </b-modal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'CryptoPaymentModal',

  computed: {
    ...mapGetters('pack', ['purchase_data'])
  },

  mounted () {
    this.$eventBus.$on('crypto-payment-successful', this.onPaymentSuccess)
  },

  methods: {
    ...mapActions('pack', ['requestCryptoPayment']),

    paymentMade () {
      this.$bvModal.hide('cryptoPaymentModal')

      this.$bvModal.hide('buyPacksModal')
    },

    async copyText (text) {
      await navigator.clipboard.writeText(text)

      this.$notify({
        type: 'success',
        text: 'Copied to clipboard',
        duration: 3000
      })
    },

    async onPaymentSuccess () {
      this.showLoadingOverlay()

      this.$bvModal.hide('cryptoPaymentModal')

      this.$bvModal.hide('buyPacksModal')

      await this.sleep(20 * 1000)

      this.hideLoadingOverlay()

      this.$bvModal.show('paymentSuccess')
    }
  }
}
</script>

<style lang="scss">
.payment-btn {
  text-transform: uppercase;
  font-weight: bold;

  img {
    width: 40px;
  }
}
</style>
