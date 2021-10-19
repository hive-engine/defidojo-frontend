<template>
  <b-modal id="paymentError" centered hide-header hide-footer>
    <template #default="{ close }">
      <div class="modal-alert">
        <div class="alert-header error">
          <v-icon name="x-circle" />
        </div>

        <div class="alert-body">
          <h3>Error!</h3>
          <p class="h6 mt-3">
            We weren't able to verify your payment. If you need any assistance, feel free to contact us.
          </p>

          <b-button class="mt-4" size="sm" variant="warning" @click.prevent="close">
            Close
          </b-button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'PaymentError'
}
</script>

<style>

</style>
