<template>
  <div>
    <b-modal id="activityModal" centered scrollable size="lg" title="Cart">
      <b-table
        v-if="cart.length > 0"
        striped
        :items="cart"
        :fields="fields"
        responsive
        borderless
      >
        <template #cell(price)="{item}">
          {{ item.for_sale ? `${item.price} ${item.priceSymbol}`: '--' }}
        </template>

        <template #cell(actions)="{item}">
          <b-button size="sm" variant="danger" @click.prevent="REMOVE_FROM_CART(item.nft_id)">
            <v-icon name="x" />
          </b-button>
        </template>
      </b-table>

      <div v-else class="p-5 text-center">
        No items found!
      </div>

      <template #modal-footer>
        <div class="w-100">
          <div v-if="$auth.loggedIn" class="d-flex justify-content-between">
            <div>
              <b-button v-if="cart.length > 0" class="mt-1" variant="warning" @click.prevent="EMPTY_CART()">
                Clear
              </b-button>
            </div>

            <div>
              <b-button v-if="!disableSellAndTransfer" class="mt-1" variant="danger" @click.prevent="$bvModal.show('burnModal')">
                Burn
              </b-button>

              <b-button v-if="!disableSellAndTransfer" class="mt-1" variant="info" @click.prevent="$bvModal.show('sellModal')">
                Sell
              </b-button>

              <b-button v-if="!disableCancelSaleAndChangePrice" class="mt-1" variant="info" @click.prevent="$bvModal.show('changePriceModal')">
                Change Price
              </b-button>

              <b-button v-if="!disableCancelSaleAndChangePrice" class="mt-1" variant="info" @click.prevent="cancelSaleNFT">
                Cancel Sale
              </b-button>

              <b-button v-if="!disableSellAndTransfer" class="mt-1" variant="info" @click.prevent="$bvModal.show('transferModal')">
                Transfer
              </b-button>

              <b-button v-if="!disableBuy" class="mt-1" variant="info" @click.prevent="$bvModal.show('buyModal')">
                Buy
              </b-button>
            </div>
          </div>

          <div v-else class="text-center">
            <b-button variant="primary" @click.prevent="$bvModal.show('loginModal')">
              Login
            </b-button>
          </div>
        </div>
      </template>
    </b-modal>

    <b-modal id="transferModal" body-class="activity-modal" size="lg" centered title="Transfer NFT">
      <b-form-group description="Enter Hive username of the recipient" label="Recipient *">
        <b-input-group prepend="@">
          <b-form-input v-model="$v.recipient.$model" trim :state="$v.recipient.$dirty ? !$v.recipient.$error : null" />
        </b-input-group>
      </b-form-group>

      <template #modal-footer>
        <b-button variant="info" :disabled="modalBusy || recipient.length < 3" @click.prevent="transferNFT">
          <b-spinner v-if="modalBusy" small /> Transfer
        </b-button>
      </template>
    </b-modal>

    <b-modal id="buyModal" body-class="activity-modal" size="lg" centered title="Buy NFT">
      <p>You are about to buy the following NFTs:</p>

      <b-table striped :items="availableForBuy" :fields="fields" responsive borderless>
        <template #cell(price)="{item}">
          {{ item.for_sale ? `${item.price} ${item.priceSymbol}`: '--' }}
        </template>

        <template #cell(actions)="{item}">
          <b-button size="sm" variant="danger" @click.prevent="REMOVE_FROM_CART(item.nft_id)">
            <v-icon name="x" />
          </b-button>
        </template>
      </b-table>

      <p>Total Price: {{ calculateTotal }} {{ settings.currency }}</p>
      <p>Your Balance: {{ currencyBalance }} {{ settings.currency }}</p>

      <template #modal-footer>
        <b-button variant="info" :disabled="modalBusy || calculateTotal > currencyBalance" @click.prevent="buyNFT">
          <b-spinner v-if="modalBusy" small /> Buy
        </b-button>
      </template>
    </b-modal>

    <b-modal id="sellModal" body-class="activity-modal" size="lg" centered title="Sell NFT">
      <b-form-group description="Enter the amount you want to sell each individual NFTs for" label="Price">
        <b-input-group :append="priceSymbol">
          <b-form-input v-model="price" number type="number" trim :state="$v.price.$dirty ? !$v.price.$error : null" />
        </b-input-group>
      </b-form-group>

      <template #modal-footer>
        <b-button variant="info" :disabled="modalBusy || price < 0" @click.prevent="sellNFT">
          <b-spinner v-if="modalBusy" small /> Sell
        </b-button>
      </template>
    </b-modal>

    <b-modal id="changePriceModal" body-class="activity-modal" size="lg" centered title="Change Price">
      <b-form-group description="Enter the amount you want to sell each individual NFTs for" label="New Price">
        <b-input-group :append="settings.currency">
          <b-form-input v-model.number="newPrice" type="number" trim :state="$v.newPrice.$dirty ? !$v.newPrice.$error : null" />
        </b-input-group>
      </b-form-group>

      <template #modal-footer>
        <b-button variant="info" :disabled="modalBusy || newPrice < 0" @click.prevent="changeSellPrice">
          <b-spinner v-if="modalBusy" small /> Change Price
        </b-button>
      </template>
    </b-modal>

    <b-modal id="burnModal" body-class="activity-modal" size="lg" centered title="Burn NFT">
      <p>You are about to burn the following NFTs:</p>

      <p class="text-danger">
        Please note that this action is irreversible.
      </p>

      <template #modal-footer>
        <b-button variant="danger" :disabled="modalBusy" @click.prevent="burnNFT">
          <b-spinner v-if="modalBusy" small /> Burn
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { required, maxValue, minLength, maxLength } from 'vuelidate/lib/validators'

export default {
  name: 'ActivityModal',

  data () {
    return {
      fields: [
        { key: 'nft_id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'account', label: 'Owner / Seller' },
        { key: 'price', label: 'Price' },
        { key: 'actions', label: '' }
      ],

      price: '',
      priceSymbol: 'SWAP.HIVE',

      recipient: '',
      newPrice: '',

      currencyBalance: 0,

      modalBusy: false
    }
  },

  computed: {
    ...mapGetters(['settings']),
    ...mapGetters('cart', ['cart']),

    username () {
      return this.$auth.user.username
    },

    disableBuy () {
      return this.cart.every(c => c.account === this.username || c.for_sale === false)
    },

    disableSellAndTransfer () {
      return this.cart.every(c => c.account !== this.username || c.for_sale === true)
    },

    disableCancelSaleAndChangePrice () {
      return this.cart.every(c => c.account !== this.username || c.for_sale === false)
    },

    calculateTotal () {
      return this.cart.reduce((acc, cur) => acc + cur.price, 0)
    },

    avilableForTransferSaleBurn () {
      return this.cart.filter(c => c.account === this.username && c.for_sale === false)
    },

    availableForBuy () {
      return this.cart.filter(c => c.account !== this.username && c.for_sale === true)
    }
  },

  mounted () {
    this.$root.$on('bv::modal::show', this.activityModalsOnShow)
    this.$root.$on('bv::modal::hidden', this.activityModalsOnHidden)

    this.$eventBus.$on('transaction-broadcast-error', this.resetModalBusyState)
  },

  beforeDestroy () {
    this.$root.$off('bv::modal::show', this.activityModalsOnShow)
    this.$root.$off('bv::modal::hidden', this.activityModalsOnHidden)

    this.$eventBus.$off('transaction-broadcast-error', this.resetModalBusyState)
  },

  methods: {
    ...mapActions('cart', ['requestTransfer', 'requestSell', 'requestBuy', 'requestBurn', 'requestCancelSale', 'requestChangePrice']),
    ...mapMutations('cart', ['REMOVE_FROM_CART', 'EMPTY_CART']),

    transferNFT () {
      this.$v.recipient.$touch()

      if (!this.$v.recipient.$invalid) {
        this.modalBusy = true

        this.requestTransfer(this.recipient)
      }
    },

    changeSellPrice () {
      this.$v.newPrice.$touch()

      if (!this.$v.newPrice.$invalid) {
        this.modalBusy = true

        this.requestChangePrice(this.newPrice)
      }
    },

    sellNFT () {
      this.$v.price.$touch()

      if (!this.$v.price.$invalid) {
        this.modalBusy = true

        const { price, priceSymbol } = this

        this.requestSell({ price, priceSymbol })
      }
    },

    cancelSaleNFT () {
      this.modalBusy = true

      this.requestCancelSale()
    },

    buyNFT () {
      this.modalBusy = true

      this.requestBuy()
    },

    burnNFT () {
      this.modalBusy = true

      this.requestBurn()
    },

    async activityModalsOnShow (bvEvent, modalId) {
      if (modalId === 'activityModal') {
        this.$v.$reset()

        this.recipient = ''
        this.price = ''
        this.newPrice = ''
        this.recipients = []
      }

      if (modalId === 'buyModal') {
        const balance = await this.$sidechain.getBalance(this.$auth.user.username, this.settings.currency)

        this.currencyBalance = balance ? Number(balance.balance) : 0
      }
    },

    activityModalsOnHidden (bvEvent, modalId) {
      if (['transferModal', 'changePriceModal', 'sellModal', 'buyModal', 'burnModal', 'activityModal'].includes(modalId)) {
        this.resetModalBusyState()
      }
    },

    resetModalBusyState () {
      this.modalBusy = false
    }
  },

  validations: {
    recipient: {
      required,
      minLength: minLength(3),
      maxLength: maxLength(16),
      validUsername: (value) => {
        if (value === '') { return true }

        return /^([a-z])[a-z0-9-.]*$/.test(value)
      }
    },

    price: {
      required,
      maxValue: maxValue(Number.MAX_SAFE_INTEGER),
      valid (value) {
        if (value === '') { return true }

        return value > 0
      }
    },

    newPrice: {
      required,
      maxValue: maxValue(Number.MAX_SAFE_INTEGER),
      valid (value) {
        if (value === '') { return true }

        return value > 0
      }
    }
  }
}
</script>

<style>

</style>
