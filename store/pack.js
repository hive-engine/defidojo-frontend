export const state = () => ({
  purchase_data: null
})

export const getters = {
  purchase_data: state => state.purchase_data
}

export const mutations = {
  SET_PURCHASE_DATA (state, data) {
    state.purchase_data = data
  }
}

export const actions = {
  async startPurchase ({ commit }, { payment_method: paymentMethod, currency = 'USD', items }) {
    try {
      const purchaseData = await this.$API.$post('purchases/start', {
        username: this.$auth.user.username,
        items,
        payment_method: paymentMethod,
        currency
      })

      commit('SET_PURCHASE_DATA', purchaseData)

      return purchaseData
    } catch (e) {
      console.log(e)
    }
  },

  async validatePayPalPayment (ctx, { uid, tx }) {
    try {
      await this.$API.$post('purchases/paypal', { uid, tx })

      this.$router.app.$root.$bvModal.show('paymentSuccess')
    } catch (e) {
      this.$router.app.$root.$bvModal.show('paymentError')
      console.log(e)
    }
  },

  requestCryptoPayment ({ state, rootState, dispatch }) {
    const { payment_info: paymentInfo } = state.purchase_data

    let operations = []

    if (paymentInfo.type === 'hive') {
      operations = [['transfer', {
        from: this.$auth.user.username,
        to: paymentInfo.address,
        amount: `${paymentInfo.amount} ${paymentInfo.currency}`,
        memo: paymentInfo.memo
      }]]
    } else {
      operations = [['custom_json', {
        required_auths: [this.$auth.user.username],
        required_posting_auths: [],
        id: rootState.settings.sidechain_id,
        json: JSON.stringify({
          contractName: 'tokens',
          contractAction: 'transfer',
          contractPayload: {
            symbol: paymentInfo.currency,
            quantity: paymentInfo.amount.toString(),
            to: paymentInfo.address,
            memo: paymentInfo.memo
          }
        })
      }]]
    }

    const data = {
      operations,
      eventName: 'crypto-payment-successful'
    }

    dispatch('requestBroadcastOps', data, { root: true })
  },

  requestOpenPacks ({ rootState, dispatch }, { packSymbol, packs = 1 }) {
    const operations = [['custom_json', {
      required_auths: [this.$auth.user.username],
      required_posting_auths: [],
      id: rootState.settings.sidechain_id,
      json: JSON.stringify({
        contractName: 'packmanager',
        contractAction: 'open',
        contractPayload: {
          nftSymbol: rootState.settings.nft_symbol,
          packSymbol,
          packs
        }
      })
    }]]

    const data = {
      operations,
      eventName: 'open-packs-successful'
    }

    dispatch('requestBroadcastOps', data, { root: true })
  },

  requestTransferPacks ({ rootState, dispatch }, { symbol, recipient: to, quantity }) {
    const operations = [['custom_json', {
      required_auths: [this.$auth.user.username],
      required_posting_auths: [],
      id: rootState.settings.sidechain_id,
      json: JSON.stringify({
        contractName: 'tokens',
        contractAction: 'transfer',
        contractPayload: {
          symbol,
          to,
          quantity: quantity.toString()
        }
      })
    }]]

    const data = {
      operations,
      eventName: 'transfer-packs-successful'
    }

    dispatch('requestBroadcastOps', data, { root: true })
  }
}
