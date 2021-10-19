import { arrayChunk } from '@/utils'

export const actions = {
  async fetchSellBookByIds (ctx, ids) {
    try {
      const chunkedIds = arrayChunk(ids, 1000)

      const requests = chunkedIds.reduce((acc, cur) => {
        acc.push(this.$sidechain.getNFTSellBook({ nftId: { $in: cur.map(i => i.toString()) } }))

        return acc
      }, [])

      const sellBook = await Promise.all(requests)

      return sellBook.flat(Infinity)
    } catch (e) {
      console.log(e)
    }
  },

  async fetchCollection ({ dispatch, rootGetters }, query = {}) {
    const limit = 1000
    let results = []
    let newData = 0
    let offset = 0

    try {
      do {
        const data = await this.$sidechain.getNFTInstances(query, offset, limit)
        newData = data.length

        if (data.length > 0) {
          results.push(...data)

          if (data.length < limit) {
            newData = 0
          }
        }

        offset += 1000
      } while (newData > 0)

      let sellBook = {}

      const forSaleIds = results.filter(r => r.account === 'nftmarket').map(r => r._id)

      if (forSaleIds.length > 0) {
        const forSaleInstances = await dispatch('fetchSellBookByIds', forSaleIds)

        sellBook = forSaleInstances.reduce((acc, cur) => {
          acc[Number(cur.nftId)] = {
            price: Number(cur.price),
            priceSymbol: cur.priceSymbol,
            fee: cur.fee
          }

          return acc
        }, {})
      }

      results = results.map((c) => {
        const { edition, foil, type } = c.properties
        const { price, priceSymbol, fee } = sellBook[c._id] || { price: null, priceSymbol: null, fee: null }

        const { name, team, category, rarity } = rootGetters.types.get(type)

        return {
          nft_id: Number(c._id),
          account: c.account === 'nftmarket' ? c.previousAccount : c.account,
          name,
          team,
          category,
          edition,
          foil,
          type,
          rarity,
          price,
          priceSymbol,
          fee,
          for_sale: c.account === 'nftmarket'
        }
      })
    } catch (e) {
      console.log(e)
    }

    return results
  }
}
