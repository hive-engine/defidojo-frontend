module.exports = {
  apps: [{
    name: 'dojo-frontend',
    script: './node_modules/nuxt/bin/nuxt.js',
    watch: false,
    args: 'start',
    env_production: {
      NODE_ENV: 'production',
      API_BASE_URL: 'https://defidojo.dtools.dev/api'
    }
  }]
}
