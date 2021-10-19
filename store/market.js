export const actions = {
  async fetchOpenInterests ({ rootGetters }, query = {}) {
    const limit = 1000
    let results = []
    let newData = 0
    let offset = 0

    try {
      do {
        const data = await this.$sidechain.getNFTOpenInterest(query, offset, limit)
        newData = data.length

        if (data.length > 0) {
          results.push(...data)

          if (data.length < limit) {
            newData = 0
          }
        }

        offset += 1000
      } while (newData > 0)

      results = results.map((c) => {
        let { edition, foil, type } = c.grouping

        edition = Number(edition)
        foil = Number(foil)
        type = Number(type)

        const { name, team, category, rarity } = rootGetters.types.get(type)

        return {
          id: c._id,
          name,
          team,
          category,
          edition,
          foil,
          type,
          rarity,
          count: c.count
        }
      })
    } catch (e) {
      console.log(e)
    }

    return results
  },

  async fetchSellBook ({ rootGetters }, query = {}) {
    const limit = 1000
    let results = []
    let newData = 0
    let offset = 0

    try {
      do {
        const data = await this.$sidechain.getNFTSellBook(query, offset, limit)
        newData = data.length

        if (data.length > 0) {
          results.push(...data)

          if (data.length < limit) {
            newData = 0
          }
        }

        offset += 1000
      } while (newData > 0)

      results = results.map((c) => {
        const { price, priceSymbol, fee, grouping } = c
        let { edition, foil, type } = grouping

        edition = Number(edition)
        foil = Number(foil)
        type = Number(type)

        const { name, team, category, rarity } = rootGetters.types.get(type)

        return {
          nft_id: Number(c.nftId),
          account: c.account,
          name,
          team,
          category,
          edition,
          foil,
          type,
          rarity,
          price: Number(price),
          priceSymbol,
          fee: Number(fee),
          for_sale: true
        }
      })
    } catch (e) {
      console.log(e)
    }

    return results
  }
}
