const parseJSON = (json) => {
  let result = {}

  try {
    result = JSON.parse(json)
  } catch {
    //
  }

  return result
}

export const actions = {
  async validateTransaction (ctx, trxId) {
    let error = false
    let trx = null
    let count = 0

    do {
      try {
        await this.$chain.sleep(3000)

        trx = await this.$sidechain.getTransaction(trxId)
      } catch (e) {
        console.log(e.message)
      }

      count += 1
    } while (!trx && count < 10)

    if (trx) {
      const logs = parseJSON(trx.logs)

      if (logs.errors) {
        error = true
      } else if (trx.contract === 'packmanager') {
        if (trx.action === 'open') {
          const cards = logs.events.filter(e => e.event === 'issue')

          this.$eventBus.$emit('packs-opening-data', { cards })
        }
      }
    }

    this.$eventBus.$emit('transaction-validated', {
      trx_id: trxId,
      contract: trx ? trx.contract : null,
      action: trx ? trx.action : null,
      payload: trx ? parseJSON(trx.payload) : null,
      error
    })
  }
}
