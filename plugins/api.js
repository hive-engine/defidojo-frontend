export default ({ app, $config, $axios, $auth }, inject) => {
  const API = $axios.create({
    baseURL: $config.API_BASE_URL,
    withCredentials: true
  })

  API.onRequest((config) => {
    if (process.client) {
      if ($auth.strategy.token) {
        config.headers.Authorization = $auth.strategy.token.get()
      }
    }

    return config
  })

  API.onError(async (error) => {
    const code = parseInt(error.response && error.response.status)

    if (code === 401) {
      await $auth.refreshTokens()

      if ($auth.loggedIn) {
        return $axios(error.response.config)
      } else {
        app.router.app.$root.$bvModal.show('loginModal')
      }
    }

    return Promise.reject(error)
  })

  inject('API', API)
}
