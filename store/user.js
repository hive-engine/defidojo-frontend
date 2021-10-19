import { decrypt as WCDecrypt } from '@/utils/web-crypto'

export const actions = {
  loginWithKeychain ({ dispatch }, username) {
    if (!username) { return }

    if (!window.hive_keychain) { return }

    const ts = Date.now()

    window.hive_keychain.requestSignBuffer(username, `${username}${ts}`, 'Posting', async (r) => {
      if (r.success) {
        await dispatch('processLogin', { username, ts, sig: r.result })
      }
    })
  },

  async loginWithKey ({ dispatch }, { username, wif, nftmarketplace = false }) {
    if (!username) { return }

    if (!wif && !sessionStorage.getItem(`smartlock-${username}-posting`)) {
      try {
        wif = await dispatch('showUnlockModal', 'posting', { root: true })
      } catch {
        return
      }
    }

    wif = wif || sessionStorage.getItem(`smartlock-${username}-posting`)

    try {
      const ts = Date.now()
      const key = await WCDecrypt(wif, sessionStorage.getItem('smartlock-otp'))
      const privateKey = this.$chain.PrivateKey.fromString(key)
      const sig = privateKey.sign(Buffer.from(this.$chain.cryptoUtils.sha256(username + ts))).toString()

      await dispatch('processLogin', { username, ts, sig, smartlock: true, nftmarketplace })
    } catch (e) {
      console.log(e.message)
    }
  },

  async processLogin (ctx, { username, ts, sig, smartlock = false }) {
    try {
      const { data } = await this.$auth.login({ data: { username, ts, sig, smartlock } })

      this.$auth.setUser({ ...data, smartlock })

      localStorage.setItem('username', username)
      localStorage.setItem('smartlock', smartlock)

      this.$router.app.$root.$bvModal.hide('loginModal')
    } catch {
      //
    }
  }
}
