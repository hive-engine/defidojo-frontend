export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - DefiDojo` : 'DefiDojo'
    },
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'format-detection', content: 'telephone=no' },
      { hid: 'description', name: 'description', content: 'Open Packs and Collect NFT Cards' },
      { hid: 'og-type', property: 'og:type', content: 'website' },
      { hid: 'og-title', property: 'og:title', content: 'DefiDojo' },
      { hid: 'og-image', property: 'og:image', content: 'https://cdn.tribaldex.com/defidojo/ui/defidojo.png' },
      { hid: 'og-description', property: 'og:description', content: 'Open Packs and Collect NFT Cards' },
      { hid: 'twitter-card', name: 'twitter:card', content: 'summary_large_image' },
      { hid: 'twitter-title', name: 'twitter:title', content: 'DefiDojo' },
      { hid: 'twitter-description', name: 'twitter:description', content: 'Open Packs and Collect NFT Cards' },
      { hid: 'twitter-image', name: 'twitter:image', content: 'https://cdn.tribaldex.com/defidojo/ui/defidojo.png' }
    ],
    link: [
      { rel: 'stylesheet', type: 'text/css', href: 'https://fonts.googleapis.com/css2?family=Monda:wght@400;700&display=swap' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/scss/app.scss'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '@/plugins/init.js',
    '@/plugins/chain.js',
    '@/plugins/sidechain.js',
    '@/plugins/vue-icon.js',
    '@/plugins/vuelidate.js',
    '@/plugins/event-bus.client.js',
    '@/plugins/vue-load-script.client.js',
    '@/plugins/vue-loading-overlay.client.js',
    '@/plugins/global-mixins.js',
    '@/plugins/vue-timers.client.js',
    '@/plugins/vue-notification.js'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: false,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/auth-next'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    credentials: true
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [
      'vue-icon',
      'vue-pincode-input',
      'vue-notification'
    ],
    babel: {
      compact: true
    }
  },

  modern: process.env.NODE_ENV === 'production',

  server: {
    port: 8080,
    host: 'localhost'
  },

  publicRuntimeConfig: {
    API_BASE_URL: process.env.API_BASE_URL,
    NODES: ['https://api.hive.blog', 'https://api.deathwing.me', 'https://rpc.ecency.com'],

    axios: {
      baseURL: process.env.API_BASE_URL,
      credentials: true
    }
  },

  auth: {
    strategies: {
      cookie: {
        cookie: {
          name: null
        },
        token: {
          required: false,
          type: false,
          maxAge: 90 * 24 * 60 * 1000
        },
        user: {
          property: false,
          autoFetch: false
        },
        endpoints: {
          login: { url: '/auth/login', method: 'post' },
          logout: { url: '/auth/logout', method: 'post' },
          user: { url: '/auth/me', method: 'post' },
          csrf: false
        }
      }
    },
    redirect: {
      login: '/',
      logout: '/',
      callback: false,
      home: '/'
    },
    cookie: {
      prefix: 'auth.',
      options: {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        expires: 90
      }
    },
    localStorage: false,
    plugins: ['@/plugins/api.js']
  },

  bootstrapVue: {
    icons: false,
    bootstrapCSS: false,
    bootstrapVueCSS: false,

    componentPlugins: [
      'AlertPlugin',
      'AvatarPlugin',
      'ButtonPlugin',
      'CardPlugin',
      'FormCheckboxPlugin',
      'FormGroupPlugin',
      'FormInputPlugin',
      'FormSelectPlugin',
      'FormGroupPlugin',
      'FormSpinbuttonPlugin',
      'ImagePlugin',
      'InputGroupPlugin',
      'LayoutPlugin',
      'ListGroupPlugin',
      'ModalPlugin',
      'NavbarPlugin',
      'PaginationPlugin',
      'SidebarPlugin',
      'SpinnerPlugin',
      'TablePlugin'
    ],

    directivePlugins: ['VBTooltipPlugin']
  },

  router: {
    extendRoutes (routes, resolve) {
      return routes.map((r) => {
        const route = r

        if (route.path && route.path.startsWith('/:user')) {
          route.path = route.path.replace(':', '@:')
        }

        return route
      })
    }
  }
}
