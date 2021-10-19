import { decrypt } from '@/utils/triplesec'
import { encrypt as WCEncrypt, decrypt as WCDecrypt } from '@/utils/web-crypto'

const requestKeychain = (fn, ...args) => {
  return new Promise((resolve) => {
    window.hive_keychain[fn](...args, (r) => {
      if (r.error === 'user_cancel') {
        return resolve({ success: false, msg: r.error, cancel: true, ...r })
      }

      if (r.success) {
        return resolve({ success: true, msg: r.result, ...r })
      }

      return resolve({ success: false, msg: r.message, ...r })
    })
  })
}

export const state = () => {
  return {
    settings: {},
    types: []
  }
}

export const getters = {
  teams: () => ['Android', 'Bruiser', 'Mystic', 'Ninja'],
  rarities: () => ['Common', 'Rare', 'Epic'],
  foils: () => ['Regular', 'Gold'],
  settings: state => state.settings,
  types: state => new Map(state.types.map(t => [t.typeId, t])),
  commonTypes: state => new Map(state.types.filter(t => t.rarity === 0).map(t => [t.typeId, t])),
  rareTypes: state => new Map(state.types.filter(t => t.rarity === 1).map(t => [t.typeId, t])),
  epicTypes: state => new Map(state.types.filter(t => t.rarity === 2).map(t => [t.typeId, t]))
}

export const mutations = {
  SET_SETTINGS (state, data) {
    state.settings = data
  },

  SET_TYPES (state, data) {
    state.types = data
  }
}

export const actions = {
  async fetchSettings ({ commit }) {
    try {
      const settings = await this.$axios.$get('settings')

      commit('SET_SETTINGS', settings)
    } catch (e) {
      console.log(e.message)
    }
  },

  async fetchTypes ({ commit }) {
    try {
      const types = await this.$sidechain.getPackManagerTypes()

      commit('SET_TYPES', types)
    } catch (e) {
      console.log(e.message)
    }
  },

  async nuxtServerInit ({ dispatch }) {
    await dispatch('fetchTypes')
  },

  async requestBroadcastOps ({ commit, dispatch }, { operations, eventName, emitData, mutation, mutationData, keyType = 'Active' }) {
    const { username, smartlock } = this.$auth.user

    let success = false
    let result = {}

    if (smartlock) {
      await dispatch('showConfirmation', { title: 'Confirmation', message: 'Are you sure you want to broadcast this transaction?' })

      const keyTypeLowerCase = keyType.toLocaleLowerCase()

      try {
        let wif = sessionStorage.getItem(`smartlock-${username}-${keyTypeLowerCase}`)

        if (!wif) {
          wif = await dispatch('showUnlockModal', keyTypeLowerCase)
        }

        const key = await WCDecrypt(wif, sessionStorage.getItem('smartlock-otp'))
        const privateKey = this.$chain.PrivateKey.fromString(key)

        const client = this.$chain.getClient()

        result = await client.broadcast.sendOperations(operations, privateKey)

        success = true
      } catch {
        //
      }
    } else {
      const keychainResponse = await requestKeychain('requestBroadcast', username, operations, keyType)

      success = keychainResponse.success
      result = keychainResponse.result
    }

    if (success) {
      console.log(result)

      if (eventName) {
        this.$eventBus.$emit(eventName, emitData || result)
      }

      if (mutation) {
        commit(mutation, mutationData)
      }
    } else {
      this.$eventBus.$emit('transaction-broadcast-error', { error: 'Transaction boardcast error.', data: emitData })
    }
  },

  showConfirmation (ctx, { title, message = 'Are you sure?', variant = 'success', okText = 'Yes', cancelText = 'No' }) {
    return new Promise((resolve, reject) => {
      this.$router.app.$root.$bvModal.msgBoxConfirm(message, {
        size: 'lg',
        title,
        centered: true,
        okVariant: variant,
        okTitle: okText,
        cancelTitle: cancelText
      }).then((value) => {
        if (value) {
          return resolve()
        }

        return reject(new Error('User canceled!'))
      })
        .catch(() => reject(new Error('User canceled!')))
    })
  },

  showUnlockModal (ctx, keyType) {
    const { username } = this.$auth.user
    const h = this.$router.app.$root.$createElement
    let pin = ''

    const messageVNode = h('div', { class: 'text-center' }, [
      h('b-avatar', {
        props: {
          src: `https://images.hive.blog/u/${username}/avatar`,
          size: '100px',
          variant: 'dark'
        },
        class: 'border'
      }),
      h('div', { class: 'font-weight-bold mt-2' }, `@${username}`),
      h('b-form-group', { props: { label: 'Password' }, class: 'mt-3' }, [
        h('pincode-input', { props: { value: pin, length: 5, placeholder: '0', secure: true }, on: { input (event) { pin = event } } })
      ])
    ])

    return new Promise((resolve, reject) => {
      this.$router.app.$root.$bvModal.msgBoxConfirm([messageVNode], {
        size: 'md',
        title: 'Unlock Account',
        noCloseOnBackdrop: true,
        centered: true,
        okVariant: 'primary',
        okTitle: 'Unlock',
        cancelTitle: 'Cancel',
        headerClass: ['justify-content-center'],
        footerClass: ['justify-content-center']
      }).then(async (value) => {
        if (value) {
          try {
            let requestedKey = null
            let accounts = localStorage.getItem('smartlock-accounts')

            accounts = JSON.parse(accounts)

            const account = accounts[username]

            const keys = Object.keys(account)

            for (let i = 0; i < keys.length; i += 1) {
              const key = keys[i]

              const decryptedKey = await decrypt(account[key], pin)

              const storageKey = `smartlock-${username}-${key}`

              const wcEncrypted = await WCEncrypt(decryptedKey, sessionStorage.getItem('smartlock-otp'))

              sessionStorage.setItem(storageKey, wcEncrypted)

              if (key === keyType) {
                requestedKey = wcEncrypted
              }
            }

            return resolve(requestedKey)
          } catch (e) {
            console.log(e.message)
          }
        }

        return reject(new Error('User canceled!'))
      })
        .catch(() => reject(new Error('User canceled!')))
    })
  }
}
