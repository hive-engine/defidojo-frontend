export const state = () => {
  return {
    settings: null,
    hive_price: 0,
    token_price: 0,
    cart: [],
    series_info: {},

    user: null
  }
}

export const getters = {
  cart: state => state.cart
}

export const mutations = {
  ADD_TO_CART (state, data) {
    state.cart.push(data)
  },

  REMOVE_FROM_CART (state, data) {
    const cart = state.cart.filter(c => c.nft_id !== data)

    state.cart = cart
  },

  EMPTY_CART (state, data) {
    if (!data) {
      state.cart = []
    } else {
      data = data.map(d => Number(d))
      state.cart = state.cart.filter(c => !data.includes(c.nft_id))
    }
  }
}

export const actions = {
  requestTransfer ({ state, rootState, dispatch }, recipient) {
    const nfts = state.cart.filter(c => c.account === this.$auth.user.username && !c.for_sale).map(c => c.nft_id.toString()).slice(0, 50)

    const json = {
      contractName: 'nft',
      contractAction: 'transfer',
      contractPayload: {
        to: recipient,
        nfts: [
          { symbol: rootState.settings.nft_symbol, ids: nfts }
        ]
      }
    }

    const operations = [
      ['custom_json', {
        required_auths: [this.$auth.user.username],
        required_posting_auths: [],
        id: rootState.settings.sidechain_id,
        json: JSON.stringify(json)
      }]
    ]

    const data = {
      operations,
      eventName: 'nft-transfer-successful',
      mutation: 'cart/EMPTY_CART',
      mutationData: nfts
    }

    dispatch('requestBroadcastOps', data, { root: true })
  },

  requestSell ({ state, rootState, dispatch }, { price, priceSymbol = 'SWAP.HIVE' }) {
    const nfts = state.cart.filter(c => c.account === this.$auth.user.username && !c.for_sale).map(c => c.nft_id.toString()).slice(0, 50)

    const json = {
      contractName: 'nftmarket',
      contractAction: 'sell',
      contractPayload: {
        symbol: rootState.settings.nft_symbol,
        nfts,
        price: price.toString(),
        priceSymbol,
        fee: rootState.settings.market_fee
      }
    }

    const operations = [
      ['custom_json', {
        required_auths: [this.$auth.user.username],
        required_posting_auths: [],
        id: rootState.settings.sidechain_id,
        json: JSON.stringify(json)
      }]
    ]

    const data = {
      operations,
      eventName: 'nft-sell-successful',
      mutation: 'cart/EMPTY_CART',
      mutationData: nfts
    }

    dispatch('requestBroadcastOps', data, { root: true })
  },

  requestCancelSale ({ state, rootState, dispatch }) {
    const nfts = state.cart.filter(c => c.for_sale && c.account === this.$auth.user.username).map(c => c.nft_id.toString()).slice(0, 50)

    const json = {
      contractName: 'nftmarket',
      contractAction: 'cancel',
      contractPayload: {
        symbol: rootState.settings.nft_symbol,
        nfts
      }
    }

    const operations = [
      ['custom_json', {
        required_auths: [this.$auth.user.username],
        required_posting_auths: [],
        id: rootState.settings.sidechain_id,
        json: JSON.stringify(json)
      }]
    ]

    const data = {
      operations,
      eventName: 'nft-cancel-sell-successful',
      mutation: 'cart/EMPTY_CART',
      mutationData: nfts
    }

    dispatch('requestBroadcastOps', data, { root: true })
  },

  requestChangePrice ({ state, rootState, dispatch }, price) {
    const nfts = state.cart.filter(c => c.for_sale && c.account === this.$auth.user.username).map(c => c.nft_id.toString()).slice(0, 50)

    const json = {
      contractName: 'nftmarket',
      contractAction: 'changePrice',
      contractPayload: {
        symbol: rootState.settings.nft_symbol,
        nfts,
        price: price.toString()
      }
    }

    const operations = [
      ['custom_json', {
        required_auths: [this.$auth.user.username],
        required_posting_auths: [],
        id: rootState.settings.sidechain_id,
        json: JSON.stringify(json)
      }]
    ]

    const data = {
      operations,
      eventName: 'nft-change-price-successful',
      mutation: 'cart/EMPTY_CART',
      mutationData: nfts
    }

    dispatch('requestBroadcastOps', data, { root: true })
  },

  requestBuy ({ state, rootState, dispatch }) {
    const nfts = state.cart.filter(c => c.account !== this.$auth.user.username && c.for_sale && c.price > 0).map(c => c.nft_id.toString()).slice(0, 50)

    const json = {
      contractName: 'nftmarket',
      contractAction: 'buy',
      contractPayload: {
        symbol: rootState.settings.nft_symbol,
        nfts,
        marketAccount: rootState.settings.account
      }
    }

    const operations = [
      ['custom_json', {
        required_auths: [this.$auth.user.username],
        required_posting_auths: [],
        id: rootState.settings.sidechain_id,
        json: JSON.stringify(json)
      }]
    ]

    const data = {
      operations,
      eventName: 'nft-buy-successful',
      mutation: 'cart/EMPTY_CART',
      mutationData: nfts
    }

    dispatch('requestBroadcastOps', data, { root: true })
  },

  requestBurn ({ state, rootState, dispatch }) {
    const nfts = state.cart.filter(c => c.account === this.$auth.user.username && !c.for_sale).map(c => c.nft_id.toString()).slice(0, 50)

    const json = {
      contractName: 'nft',
      contractAction: 'burn',
      contractPayload: {
        nfts: [
          { symbol: rootState.settings.nft_symbol, ids: nfts }
        ]
      }
    }

    const operations = [
      ['custom_json', {
        required_auths: [this.$auth.user.username],
        required_posting_auths: [],
        id: rootState.settings.sidechain_id,
        json: JSON.stringify(json)
      }]
    ]

    const data = {
      operations,
      eventName: 'nft-burn-successful',
      mutation: 'cart/EMPTY_CART',
      mutationData: nfts
    }

    dispatch('requestBroadcastOps', data, { root: true })
  }
}
