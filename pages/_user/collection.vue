<template>
  <div class="collection">
    <b-container fluid="lg">
      <b-row>
        <b-col class="text-center" sm="3">
          <b-form-group label="For Sale" label-class="font-weight-bold">
            <template v-for="(forSale, i) of forSaleOptions">
              <div :key="i" class="filter-button">
                <input
                  :id="`forSale-${forSale.value}`"
                  v-model="forSaleFilter"
                  type="radio"
                  name="forSale"
                  :value="forSale.value"
                  hidden
                >
                <label v-b-tooltip.hover.v-info :title="forSale.text" :for="`forSale-${forSale.value}`">{{ forSale.text[0] }}</label>
              </div>
            </template>
          </b-form-group>
        </b-col>

        <b-col class="text-center" sm="3">
          <b-form-group label="Foils" label-class="font-weight-bold">
            <template v-for="(foil, i) of foilOptions">
              <div :key="i" class="filter-button">
                <input
                  :id="`foil-${foil.value}`"
                  v-model="foils"
                  type="checkbox"
                  name="foil"
                  :value="foil.value"
                  hidden
                >
                <label v-b-tooltip.hover.v-info :title="foil.text" :for="`foil-${foil.value}`">{{ foil.text[0] }}</label>
              </div>
            </template>
          </b-form-group>
        </b-col>

        <b-col class="text-center" sm="3">
          <b-form-group label="Rarity" label-class="font-weight-bold">
            <template v-for="(rarity, i) of rarityOptions">
              <div :key="i" class="filter-button">
                <input
                  :id="`rarity-${rarity.value}`"
                  v-model="rarities"
                  type="checkbox"
                  name="rarity"
                  :value="rarity.value"
                  hidden
                >
                <label v-b-tooltip.hover.v-info :title="rarity.text" :for="`rarity-${rarity.value}`">{{ rarity.text[0] }}</label>
              </div>
            </template>
          </b-form-group>
        </b-col>

        <b-col class="text-center" sm="3">
          <b-form-group label="Teams" label-class="font-weight-bold">
            <template v-for="(team, i) of teamOptions">
              <div :key="i" class="filter-button">
                <input
                  :id="`team-${team.value}`"
                  v-model="teams"
                  type="checkbox"
                  name="team"
                  :value="team.value"
                  hidden
                >
                <label v-b-tooltip.hover.v-info :title="team.text" :for="`team-${team.value}`">{{ team.text[0] }}</label>
              </div>
            </template>
          </b-form-group>
        </b-col>
      </b-row>

      <template v-if="!loading">
        <b-row v-if="Object.keys(groupedByFoil).length >0" class="mt-5">
          <template v-for="type of Object.keys(groupedByFoil)">
            <b-col
              v-for="cards of groupedByFoil[type]"
              :key="cards[0].nft_id"
              sm="6"
              md="4"
              lg="3"
              class="mb-5"
            >
              <div class="dojo" @click.prevent="showCollectionModal(cards)">
                <div class="card-count">
                  {{ cards.length }}
                </div>

                <b-img-lazy fluid :src="`https://cdn.tribaldex.com/packmanager/${settings.nft_symbol}/${cards[0].edition}_${cards[0].type}_${cards[0].foil}.png`" />
              </div>
            </b-col>
          </template>
        </b-row>

        <b-card v-else class="text-center mt-5">
          @{{ $route.params.user }} does not exists or does not have any cards.
        </b-card>
      </template>
    </b-container>

    <collection-cards :cards="selectedCards" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { groupBy } from '@/utils'
import CollectionCards from '@/components/modals/CollectionCards.vue'
import NFTMixin from '@/mixins/nft'

export default {
  name: 'CollectionPage',

  components: {
    CollectionCards
  },

  mixins: [NFTMixin],

  data () {
    return {
      collection: [],

      foilOptions: [{ value: 0, text: 'Regular' }, { value: 1, text: 'Gold' }],
      foils: [],

      rarityOptions: [{ value: 0, text: 'Common' }, { value: 1, text: 'Rare' }, { value: 2, text: 'Epic' }],
      rarities: [],

      teamOptions: [{ value: 0, text: 'Android' }, { value: 1, text: 'Bruiser' }, { value: 2, text: 'Mystic' }, { value: 3, text: 'Ninja' }],
      teams: [],

      forSaleOptions: [{ value: 0, text: 'All' }, { value: 1, text: 'For Sale' }],
      forSaleFilter: 0,

      selectedCards: []
    }
  },

  async fetch () {
    this.loading = true

    this.collection = await this.fetchCollection({
      $or: [
        { account: this.$route.params.user },
        { account: 'nftmarket', ownedBy: 'c', previousAccount: this.$route.params.user }
      ]
    })

    this.loading = false
  },

  head () {
    return {
      title: 'Collection'
    }
  },

  computed: {
    ...mapGetters(['settings']),

    computedCollection () {
      let { collection } = this

      if (this.forSaleFilter) {
        collection = collection.filter(c => c.for_sale)
      }

      if (this.foils.length > 0) {
        collection = collection.filter(c => this.foils.includes(c.foil))
      }

      if (this.teams.length > 0) {
        collection = collection.filter(c => this.teams.includes(c.team))
      }

      if (this.rarities.length > 0) {
        collection = collection.filter(c => this.rarities.includes(c.rarity))
      }

      return collection
    },

    groupedByType () {
      const { computedCollection } = this

      return groupBy(computedCollection, 'type')
    },

    groupedByFoil () {
      return Object.keys(this.groupedByType).reduce((acc, cur) => {
        const col = this.groupedByType[cur]

        const grouped = groupBy(col, 'foil')

        acc[cur] = grouped

        return acc
      }, {})
    }
  },

  watch: {
    loading (isLoading) {
      if (isLoading) {
        this.showLoadingOverlay()
      } else {
        this.hideLoadingOverlay()
      }
    }
  },

  mounted () {
    this.$eventBus.$on([
      'nft-transfer-successful',
      'nft-buy-successful',
      'nft-sell-successful',
      'nft-cancel-sell-successful',
      'nft-change-price-successful',
      'nft-burn-successful'
    ], this.requestValidateTransaction)

    this.$eventBus.$on('transaction-validated', this.$fetch)
  },

  beforeDestroy () {
    this.$eventBus.$off([
      'nft-transfer-successful',
      'nft-buy-successful',
      'nft-sell-successful',
      'nft-cancel-sell-successful',
      'nft-change-price-successful',
      'nft-burn-successful'
    ], this.requestValidateTransaction)

    this.$eventBus.$off('transaction-validated', this.$fetch)
  },

  methods: {
    ...mapActions('collection', ['fetchCollection']),

    showCollectionModal (cards) {
      this.selectedCards = cards

      this.$bvModal.show('collectionCardsModal')
    }
  }
}
</script>

<style>

</style>
