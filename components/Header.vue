<template>
  <header>
    <b-navbar type="dark" variant="dark">
      <b-container fluid="lg">
        <b-navbar-brand to="/">
          <h4 class="m-0">
            DefiDojo
          </h4>
        </b-navbar-brand>

        <b-navbar-nav class="ml-auto align-items-center d-none d-sm-flex">
          <b-nav-item class="text-center" @click.prevent="$bvModal.show('buyPacksModal')">
            <img class="d-block mx-auto" src="/icons/stack.svg" style="width:25px">
            <div class="mt-1">
              Buy Packs
            </div>
          </b-nav-item>

          <b-nav-item class="text-center" :to="{name:'open'}">
            <img class="d-block mx-auto" src="/icons/dices.svg" style="width:25px">
            <div class="mt-1">
              Open
            </div>
          </b-nav-item>

          <b-nav-item class="text-center" :to="{name:'market'}">
            <img class="d-block mx-auto" src="/icons/shop.svg" style="width:25px">
            <div class="mt-1">
              Market
            </div>
          </b-nav-item>

          <b-nav-item class="text-center cart-icon" @click.prevent="$bvModal.show('activityModal')">
            <img class="d-block mx-auto" src="/icons/cart.svg" style="width:25px">
            <div class="mt-1">
              Cart
            </div>

            <div class="cart-item-count badge badge-danger">
              {{ cart.length }}
            </div>
          </b-nav-item>

          <b-nav-item v-if="!$auth.loggedIn" class="text-center" @click.prevent="$bvModal.show('loginModal')">
            <img class="d-block mx-auto" src="/icons/login.svg" style="width:25px">
            <div class="mt-1">
              Login
            </div>
          </b-nav-item>

          <b-nav-item-dropdown v-else variant="link" no-caret right>
            <template #button-content>
              <b-avatar class="d-block mx-auto" :src="`https://images.hive.blog/u/${$auth.user.username}/avatar`" variant="light" size="25px" />

              <div>@{{ $auth.user.username }} <v-icon name="chevron-down" /></div>
            </template>

            <b-dropdown-item :to="{name:'user-collection', params:{user:$auth.user.username}}">
              Collection
            </b-dropdown-item>

            <b-dropdown-item @click.prevent="$auth.logout()">
              Logout
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>

        <b-navbar-nav class="d-sm-none">
          <b-button v-b-toggle.sidebar-menu variant="outline-secondary">
            <v-icon name="menu" />
          </b-button>
        </b-navbar-nav>
      </b-container>
    </b-navbar>

    <b-sidebar
      id="sidebar-menu"
      right
      shadow
      bg-variant="dark"
      text-variant="light"
      class="sidebar-menu"
      backdrop
    >
      <template #title>
        {{ $auth.loggedIn ? `@${$auth.user.username}` : 'Menu' }}
      </template>

      <b-list-group flush>
        <b-list-group-item href="#" @click.prevent="$bvModal.show('buyPacksModal')">
          Buy Packs
        </b-list-group-item>

        <b-list-group-item :to="{name:'market'}">
          Market
        </b-list-group-item>

        <b-list-group-item href="#" @click.prevent="$bvModal.show('activityModal')">
          Cart

          <div class="cart-item-count badge badge-danger">
            {{ cart.length }}
          </div>
        </b-list-group-item>

        <b-list-group-item v-if="!$auth.loggedIn" href="#" @click.prevent="$bvModal.show('loginModal')">
          Login
        </b-list-group-item>

        <template v-else>
          <b-list-group-item :to="{name:'open'}">
            Open
          </b-list-group-item>

          <b-list-group-item :to="{name:'user-collection', params:{user:$auth.user.username}}">
            Collection
          </b-list-group-item>

          <b-list-group-item href="#" @click.prevent="$auth.logout()">
            Logout
          </b-list-group-item>
        </template>
      </b-list-group>
    </b-sidebar>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Header',

  computed: {
    ...mapGetters('cart', ['cart'])
  }
}
</script>

<style>

</style>
