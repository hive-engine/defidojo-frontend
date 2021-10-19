<template>
  <b-modal id="paymentSuccess" centered hide-header hide-footer>
    <template #default="{ close }">
      <div class="modal-alert">
        <div class="alert-header success">
          <v-icon name="check-circle" />
        </div>

        <div class="alert-body">
          <h3>Success!</h3>
          <p class="h6 mt-3">
            We have received your payment and now verifying. Your purchased packs will be issued shortly.
          </p>

          <b-button class="mt-4" size="sm" variant="success" @click.prevent="close">
            Close
          </b-button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'PaymentSuccess'
}
</script>

<style>

</style>
