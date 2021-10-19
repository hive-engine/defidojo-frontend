<template>
  <div class="homepage">
    <div class="masthead">
      <h1>DefiDojo</h1>

      <h5 class="text-muted">
        Open Packs and Collect NFT Cards
      </h5>
    </div>

    <b-container fluid>
      <b-row>
        <b-col md="4" class="box box-1">
          <a href="#" class="h1" @click.prevent="$bvModal.show('buyPacksModal')">
            Packs
          </a>
        </b-col>

        <b-col md="4" class="box box-2">
          <nuxt-link :to="{name:'open'}" class="h1">
            Open
          </nuxt-link>
        </b-col>

        <b-col md="4" class="box box-3">
          <nuxt-link :to="{name:'market'}" class="h1">
            Market
          </nuxt-link>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'Home',

  head () {
    return {
      title: ''
    }
  }
}
</script>
