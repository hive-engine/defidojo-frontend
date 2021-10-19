<template>
  <b-modal id="marketCardsModal" centered title-tag="div" size="xl" hide-footer>
    <template #modal-title>
      <h5>{{ computedTitle }}</h5>

      <ul class="list-inline mb-0">
        <li class="list-inline-item">
          <span class="text-muted">ID:</span> {{ card.type }}
        </li>

        <li class="list-inline-item">
          <span class="text-muted">Team:</span> {{ teams[card.team] }}
        </li>

        <li class="list-inline-item">
          <span class="text-muted">Rarity:</span> {{ rarities[card.rarity] }}
        </li>

        <li class="list-inline-item">
          <span class="text-muted">Foil:</span> {{ foils[card.foil] }}
        </li>
      </ul>
    </template>

    <b-row>
      <b-col sm="4" class="text-center mb-3">
        <b-img-lazy v-if="cardImage" fluid :src="cardImage" />
      </b-col>

      <b-col class="mb-3">
        <b-table
          responsive
          striped
          show-empty
          hover
          :fields="fields"
          :items="cards"
          :per-page="perPage"
          :current-page="currentPage"
          :busy="isBusy"
        >
          <template #table-busy>
            <div class="text-center my-2">
              <b-spinner class="align-middle" small />
              <strong>Loading...</strong>
            </div>
          </template>

          <template #cell(price)="{item}">
            {{ item.for_sale ? `${item.price} ${item.priceSymbol}`: 'N/A' }}
          </template>

          <template #cell(actions)="{item}">
            <add-to-cart :card="item" :items="cards" />
          </template>
        </b-table>

        <b-pagination v-model="currentPage" align="center" size="sm" :total-rows="cards.length" :per-page="perPage" />
      </b-col>
    </b-row>
  </b-modal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import AddToCart from '@/components/AddToCart.vue'

export default {
  name: 'MarketCardsModal',

  components: {
    AddToCart
  },

  props: {
    card: { type: Object, required: true }
  },

  data () {
    return {
      currentPage: 1,
      perPage: 15,

      fields: [
        { key: 'nft_id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name' },
        { key: 'account', label: 'Seller' },
        { key: 'price', label: 'Price', sortable: true },
        { key: 'actions', lable: '' }
      ],

      isBusy: false,

      cards: []
    }
  },

  computed: {
    ...mapGetters(['settings', 'teams', 'rarities', 'foils']),

    computedTitle () {
      if (this.card.name) {
        return this.card.name
      }

      return ''
    },

    cardImage () {
      if (Object.keys(this.card).length > 0) {
        return `https://cdn.tribaldex.com/packmanager/${this.settings.nft_symbol}/${this.card.edition}_${this.card.type}_${this.card.foil}.png`
      }

      return null
    }
  },

  mounted () {
    this.$root.$on('bv::modal::shown', this.onModalShown)
    this.$root.$on('bv::modal::hidden', this.onModalHidden)
  },

  beforeDestroy () {
    this.$root.$off('bv::modal::shown', this.onModalShown)
    this.$root.$off('bv::modal::hidden', this.onModalHidden)
  },

  methods: {
    ...mapActions('market', ['fetchSellBook']),

    async onModalShown (btnEvent, modalId) {
      if (modalId === 'marketCardsModal') {
        this.isBusy = true

        const { edition, foil, type } = this.card

        this.cards = await this.fetchSellBook({
          'grouping.type': type.toString(),
          'grouping.foil': foil.toString(),
          'grouping.edition': edition.toString(),
          priceSymbol: this.settings.currency
        })

        this.isBusy = false
      }
    },

    onModalHidden (btnEvent, modalId) {
      if (modalId === 'marketCardsModal') {
        this.currentPage = 1
        this.isBusy = false
        this.cards = []
      }
    }
  }
}
</script>

<style>

</style>
