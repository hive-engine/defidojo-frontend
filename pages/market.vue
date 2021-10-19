<template>
  <div class="market">
    <b-container fluid="lg">
      <b-row align-h="center">
        <b-col class="text-center" sm="4">
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

        <b-col class="text-center" sm="4">
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

        <b-col class="text-center" sm="4">
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

      <b-row v-if="!loading" class="mt-5">
        <template v-if="computedInterests.length >0">
          <b-col
            v-for="interest of computedInterests"
            :key="interest.id"
            sm="6"
            md="4"
            lg="3"
            class="mb-5"
          >
            <div class="dojo" @click.prevent="showMarketModal(interest)">
              <div class="card-count">
                {{ interest.count }}
              </div>

              <b-img-lazy fluid :src="`https://cdn.tribaldex.com/packmanager/${settings.nft_symbol}/${interest.edition}_${interest.type}_${interest.foil}.png`" />
            </div>
          </b-col>
        </template>

        <b-col v-else>
          <b-card class="text-center">
            Looks like nobody wants to sell their precious DOJOs!
          </b-card>
        </b-col>
      </b-row>
    </b-container>

    <market-cards-modal :card="selectedCard" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import MarketCardsModal from '@/components/modals/MarketCards.vue'
import NFTMixin from '@/mixins/nft'

export default {
  name: 'MarketPage',

  components: {
    MarketCardsModal
  },

  mixins: [NFTMixin],

  data () {
    return {
      interests: [],

      foilOptions: [{ value: 0, text: 'Regular' }, { value: 1, text: 'Gold' }],
      foils: [],

      rarityOptions: [{ value: 0, text: 'Common' }, { value: 1, text: 'Rare' }, { value: 2, text: 'Epic' }],
      rarities: [],

      teamOptions: [{ value: 0, text: 'Android' }, { value: 1, text: 'Bruiser' }, { value: 2, text: 'Mystic' }, { value: 3, text: 'Ninja' }],
      teams: [],

      selectedCard: {}
    }
  },

  async fetch () {
    this.loading = true

    this.interests = await this.fetchOpenInterests({ priceSymbol: this.settings.currency, count: { $gt: 0 } })

    this.loading = false
  },

  head () {
    return {
      title: 'Market'
    }
  },

  computed: {
    ...mapGetters(['settings']),

    computedInterests () {
      let { interests } = this

      if (this.foils.length > 0) {
        interests = interests.filter(c => this.foils.includes(c.foil))
      }

      if (this.teams.length > 0) {
        interests = interests.filter(c => this.teams.includes(c.team))
      }

      if (this.rarities.length > 0) {
        interests = interests.filter(c => this.rarities.includes(c.rarity))
      }

      return interests
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
      'nft-buy-successful',
      'nft-sell-successful',
      'nft-cancel-sell-successful',
      'nft-change-price-successful'
    ], this.requestValidateTransaction)

    this.$eventBus.$on('transaction-validated', this.$fetch)
  },

  beforeDestroy () {
    this.$eventBus.$off([
      'nft-buy-successful',
      'nft-sell-successful',
      'nft-cancel-sell-successful',
      'nft-change-price-successful'
    ], this.requestValidateTransaction)

    this.$eventBus.$off('transaction-validated', this.$fetch)
  },

  methods: {
    ...mapActions('market', ['fetchOpenInterests']),

    showMarketModal (card) {
      this.selectedCard = card

      this.$bvModal.show('marketCardsModal')
    }
  }
}
</script>

<style>

</style>
