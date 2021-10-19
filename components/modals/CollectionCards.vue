<template>
  <b-modal id="collectionCardsModal" centered title-tag="div" size="xl" hide-footer>
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
      <b-col sm="4">
        <b-img-lazy v-if="cardImage" fluid :src="cardImage" />
      </b-col>

      <b-col>
        <b-table
          responsive
          striped
          show-empty
          hover
          :fields="fields"
          :items="cards"
          :per-page="perPage"
          :current-page="currentPage"
        >
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
import { mapGetters } from 'vuex'
import AddToCart from '@/components/AddToCart.vue'

export default {
  name: 'CollectionCards',

  components: {
    AddToCart
  },

  props: {
    cards: { type: Array, required: true }
  },

  data () {
    return {
      currentPage: 1,
      perPage: 15,

      fields: [
        { key: 'nft_id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name' },
        { key: 'account', label: 'Account' },
        { key: 'price', label: 'Price' },
        { key: 'actions', lable: '' }
      ]
    }
  },

  computed: {
    ...mapGetters(['settings', 'teams', 'rarities', 'foils']),

    card () {
      if (this.cards.length > 0) {
        return this.cards[0]
      }

      return {}
    },

    computedTitle () {
      if (this.cards.length > 0) {
        return this.cards[0].name
      }

      return ''
    },

    cardImage () {
      if (this.cards.length > 0) {
        return `https://cdn.tribaldex.com/packmanager/${this.settings.nft_symbol}/${this.card.edition}_${this.card.type}_${this.card.foil}.png`
      }

      return null
    }
  },

  mounted () {
    this.$root.$on('bv::modal::hidden', this.onModalHidden)
  },

  beforeDestroy () {
    this.$root.$off('bv::modal::hidden', this.onModalHidden)
  },

  methods: {
    onModalHidden (btnEvent, modalId) {
      if (modalId === 'collectionCardsModal') {
        this.currentPage = 1
      }
    }
  }
}
</script>

<style>

</style>
