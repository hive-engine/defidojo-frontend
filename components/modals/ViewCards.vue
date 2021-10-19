<template>
  <b-modal
    id="viewCardsModal"
    hide-footer
    modal-class="view-cards-modal"
    size="xl"
    no-close-on-backdrop
    hide-header
  >
    <template #default="{close}">
      <b-row v-if="computedCards.length > 0" align-h="center" align-v="stretch">
        <b-col
          v-for="({type, image}, c) of computedCards"
          :key="c"
          class="mb-5 text-center"
          sm="6"
          md="4"
          lg="3"
        >
          <div class="packmanager-card">
            <div v-if="!viewAll || viewAll === null" class="card-overlay" :class="{rare: rareTypes.has(type), epic: epicTypes.has(type)}" @click.prevent="e => e.target.remove()" />

            <b-img-lazy fluid :src="image" />
          </div>
        </b-col>
      </b-row>

      <div class="text-center mt-5">
        <b-button @click="viewAll = true">
          View All
        </b-button>

        <b-button variant="primary" @click.prevent="close">
          Close
        </b-button>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ViewCardsModal',

  props: {
    cards: { type: Array, required: true }
  },

  data () {
    return {
      viewAll: null
    }
  },

  computed: {
    ...mapGetters(['rareTypes', 'epicTypes']),

    computedCards () {
      const cards = this.cards.map((c) => {
        const { edition, foil, type } = c.data.properties

        return {
          edition,
          foil,
          type,
          image: `https://cdn.tribaldex.com/packmanager/${c.data.symbol}/${edition}_${type}_${foil}.png`
        }
      })

      return cards
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
      if (modalId === 'viewCardsModal') {
        this.viewAll = null
      }
    }
  }
}
</script>

<style>

</style>
