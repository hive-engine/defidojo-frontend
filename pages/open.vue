<template>
  <div class="open-packs">
    <b-container class="mt-5">
      <div class="pack-dropzone">
        <drop @drop="dropReceived">
          <div class="border-circle">
            <div class="view">
              <div class="plane main" :class="{animate: opening}">
                <div class="circle" />
                <div class="circle" />
                <div class="circle" />
                <div class="circle" />
                <div class="circle" />
                <div class="circle" />
              </div>
            </div>
          </div>
        </drop>
      </div>

      <div v-if="!loading" class="pack-list mt-5">
        <b-row align-h="center">
          <b-col v-for="({symbol, image}, i) of settings.packs" :key="i" sm="6" md="4" class="mb-3">
            <div class="pack">
              <drag effect-allowed="move" :draggable="balances[symbol].balance > 0" :class="{ 'cursor-grab': balances[symbol].balance > 0 }" :image="image" :transfer-data="{symbol, quantity: 1}">
                <img :src="image" :alt="`${symbol} Icon`">
              </drag>

              <div class="quantity">
                x{{ balances[symbol].balance }} {{ symbol }}
              </div>

              <div class="actions">
                <b-button
                  v-b-tooltip.hover
                  size="sm"
                  :disabled="balances[symbol].balance <= 0"
                  variant="primary"
                  title="Open Multiple"
                  @click.prevent="openMultiple(symbol)"
                >
                  <v-icon name="copy" />
                </b-button>

                <b-button
                  v-b-tooltip.hover
                  size="sm"
                  :disabled="balances[symbol].balance <= 0"
                  variant="primary"
                  title="Send"
                  @click.prevent="transfer(symbol)"
                >
                  <v-icon name="send" />
                </b-button>
              </div>
            </div>
          </b-col>
        </b-row>
      </div>
    </b-container>

    <b-modal id="multiplePackOpenModal" centered title="Pack Quantity">
      <b-form-group label="Quantity" :description="`You may open a maximum of ${selectedPack.max_open} at once.`">
        <b-input-group :append="selectedPack.symbol">
          <b-form-input
            v-model="packsQuantity"
            number
            placeholder="1"
            type="number"
            min="1"
            :max="selectedPack.balance > selectedPack.max_open ? selectedPack.max_open : selectedPack.balance"
          />
        </b-input-group>
      </b-form-group>

      <template #modal-footer>
        <b-button variant="primary" @click.prevent="dropReceived({ symbol: selectedPack.symbol, quantity: packsQuantity })">
          Open
        </b-button>
      </template>
    </b-modal>

    <b-modal id="transferPacksModal" centered title="Transfer Packs">
      <b-form-group label="Recipient">
        <b-input-group prepend="@">
          <b-form-input v-model="recipient" trim placeholder="Hive username" :state="$v.recipient.$dirty ? !$v.recipient.$error : null" @input="recipient = $event.toLowerCase()" />
        </b-input-group>
      </b-form-group>

      <b-form-group label="Quantity">
        <b-input-group :append="selectedPack.symbol">
          <b-form-input
            v-model.number="packsQuantity"
            placeholder="1"
            type="number"
            min="1"
            :max="selectedPack.balance"
            :state="$v.packsQuantity.$dirty ? !$v.packsQuantity.$error : null"
          />
        </b-input-group>
      </b-form-group>

      <template #modal-footer>
        <b-button variant="primary" @click.prevent="transferPacks">
          Send
        </b-button>
      </template>
    </b-modal>

    <view-cards :cards="cards" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { required, minLength, maxLength, minValue } from 'vuelidate/lib/validators'
import { Drag, Drop } from 'vue-drag-drop'
import ViewCards from '@/components/modals/ViewCards.vue'

export default {
  name: 'Open',

  components: {
    Drag,
    Drop,
    ViewCards
  },

  middleware: 'auth',

  data () {
    return {
      packs: [],
      cards: [],

      packsQuantity: 1,
      balances: {},

      selectedPack: {
        balance: 0,
        max_open: 0
      },

      recipient: '',

      opening: null
    }
  },

  async fetch () {
    this.showLoadingOverlay()

    this.loading = true

    await this.fetchBalances()

    this.loading = false

    this.hideLoadingOverlay()
  },

  head () {
    return {
      title: 'Open'
    }
  },

  computed: {
    ...mapGetters(['settings']),

    mappedPacks () {
      return new Map(this.settings.packs.map(p => [p.symbol, p]))
    },

    packSymbols () {
      return this.settings.packs.map(p => p.symbol)
    }
  },

  mounted () {
    this.$eventBus.$on('open-packs-successful', this.onOpenPacks)
    this.$eventBus.$on('packs-opening-data', this.onPacksOpening)
    this.$eventBus.$on('transfer-packs-successful', this.onTransferPacks)
    this.$eventBus.$on('transaction-validated', this.fetchBalances)

    this.$eventBus.$on('transaction-broadcast-error', () => {
      if (this.opening) {
        this.opening = false
      }
    })
  },

  beforeDestroy () {
    this.$eventBus.$off('open-packs-successful', this.onOpenPacks)
    this.$eventBus.$off('packs-opening-data', this.onPacksOpening)
    this.$eventBus.$off('transfer-packs-successful', this.onTransferPacks)
    this.$eventBus.$off('transaction-validated', this.fetchBalances)

    this.$eventBus.$off('transaction-broadcast-error')
  },

  methods: {
    ...mapActions('pack', ['requestOpenPacks', 'requestTransferPacks']),
    ...mapActions('transaction', ['validateTransaction']),

    dropReceived ({ symbol, quantity }) {
      this.opening = true

      this.requestOpenPacks({ packSymbol: symbol, packs: quantity })

      // this.$eventBus.$emit('open-packs-successful', { id: '56b6b56cf37d0a4cbf643e1787c7faea69f182f6' })
    },

    openMultiple (symbol) {
      const { balance, max_open: maxOpen } = this.balances[symbol]

      this.selectedPack = { symbol, balance, max_open: maxOpen }

      this.$bvModal.show('multiplePackOpenModal')
    },

    async onOpenPacks (data) {
      this.showLoadingOverlay()

      this.$bvModal.hide('multiplePackOpenModal')

      this.packsQuantity = 1

      await this.validateTransaction(data.id)

      this.hideLoadingOverlay()
    },

    onPacksOpening ({ cards }) {
      if (this.opening) {
        this.opening = false
      }

      this.cards = cards

      this.$bvModal.show('viewCardsModal')
    },

    async onTransferPacks (data) {
      this.showLoadingOverlay()

      this.$bvModal.hide('transferPacksModal')

      this.packsQuantity = 1
      this.recipient = ''

      await this.validateTransaction(data.id)

      this.hideLoadingOverlay()
    },

    async fetchBalances () {
      let packBalance = await this.$sidechain.getBalance(this.$auth.user.username, this.packSymbols)

      packBalance = packBalance.reduce((acc, cur) => {
        acc[cur.symbol] = {
          balance: Number(cur.balance),
          max_open: this.mappedPacks.get(cur.symbol).max_open
        }

        return acc
      }, {})

      this.balances = this.packSymbols.reduce((acc, cur) => {
        acc[cur] = packBalance[cur] || { balance: 0, max_open: 0 }

        return acc
      }, {})
    },

    transfer (symbol) {
      const { balance } = this.balances[symbol]

      this.selectedPack = { symbol, balance }

      this.$bvModal.show('transferPacksModal')
    },

    transferPacks () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.requestTransferPacks({ symbol: this.selectedPack.symbol, recipient: this.recipient, quantity: this.packsQuantity })
      }
    }
  },

  validations: {
    packsQuantity: {
      required,
      minValue: minValue(1)
    },

    recipient: {
      required,
      minLength: minLength(3),
      maxLength: maxLength(16),
      validUsername (value) {
        if (value === '') { return true }

        return /^([a-z])[a-z0-9-.]*$/.test(value)
      }
    }
  },

  timers: {
    fetchBalances: { time: 60 * 1000, autostart: true, repeat: true }
  }
}
</script>

<style>

</style>
