import axios from 'axios'

export default ({ store }, inject) => {
  const { nft_symbol: nftSymbol, sidechain_rpc: rpcNode } = store.state.settings

  const sidechain = {
    async call (endpoint, request) {
      const postData = {
        jsonrpc: '2.0',
        id: Date.now(),
        ...request
      }

      let result = null

      const query = await axios.post(`${rpcNode}/${endpoint}`, postData, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })

      result = query.data.result

      return result
    },

    blockchain (request) {
      return this.call('blockchain', request)
    },

    contract (request) {
      return this.call('contracts', request)
    },

    getBalance (account, symbol) {
      const query = { account }
      let method = 'findOne'

      if (Array.isArray(symbol)) {
        method = 'find'
        query.symbol = { $in: symbol }
      } else {
        query.symbol = symbol
      }

      const request = {
        method,
        params: {
          contract: 'tokens',
          table: 'balances',
          query
        }
      }

      return this.contract(request)
    },

    getAccountsBalance (accounts, symbol) {
      const query = { symbol }

      if (Array.isArray(accounts)) {
        query.account = { $in: accounts }
      } else {
        query.account = accounts
      }

      const request = {
        method: 'find',
        params: {
          contract: 'tokens',
          table: 'balances',
          query
        }
      }

      return this.contract(request)
    },

    getContractParams (contractName) {
      const request = {
        method: 'findOne',
        params: {
          contract: contractName,
          table: 'params',
          query: {}
        }
      }

      return this.contract(request)
    },

    getNFTs (query, offset = 0, limit = 1000) {
      const request = {
        method: 'find',
        params: {
          contract: 'nft',
          table: 'nfts',
          query,
          offset,
          limit
        }
      }

      return this.contract(request)
    },

    getNFTSellBook (query, offset = 0, limit = 1000) {
      const symbol = query.symbol || nftSymbol

      delete query.symbol

      const request = {
        method: 'find',
        params: {
          contract: 'nftmarket',
          table: `${symbol}sellBook`,
          query,
          offset,
          limit
        }
      }

      return this.contract(request)
    },

    getNFTInstances (query, offset = 0, limit = 1000) {
      const symbol = query.symbol || nftSymbol

      delete query.symbol

      const request = {
        method: 'find',
        params: {
          contract: 'nft',
          table: `${symbol}instances`,
          query,
          offset,
          limit
        }
      }

      return this.contract(request)
    },

    getNFTOpenInterest (query, offset = 0, limit = 1000) {
      const symbol = query.symbol || nftSymbol

      delete query.symbol

      const request = {
        method: 'find',
        params: {
          contract: 'nftmarket',
          table: `${symbol}openInterest`,
          query,
          offset,
          limit
        }
      }

      return this.contract(request)
    },

    getTokens (query = {}, offset = 0, limit = 1000) {
      const request = {
        method: 'find',
        params: {
          contract: 'tokens',
          table: 'tokens',
          query,
          offset,
          limit
        }
      }

      return this.contract(request)
    },

    getPackManagerTypes (query = {}, offset = 0, limit = 1000) {
      query.nft = query.nft || nftSymbol

      const request = {
        method: 'find',
        params: {
          contract: 'packmanager',
          table: 'types',
          query,
          offset,
          limit
        }
      }

      return this.contract(request)
    },

    getTransaction (txid) {
      const request = {
        method: 'getTransactionInfo',
        params: {
          txid
        }
      }

      return this.blockchain(request)
    }
  }

  inject('sidechain', sidechain)
}
