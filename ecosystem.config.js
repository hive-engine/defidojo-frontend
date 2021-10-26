module.exports = {
  apps: [{
    name: 'dojo-frontend',
    script: './node_modules/nuxt/bin/nuxt.js',
    watch: false,
    args: 'start',
    env_production: {
      NODE_ENV: 'production',
      API_BASE_URL: 'https://defidojo.dev/api'
    }
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: ['defidojo.dev'],
      ref: 'origin/master',
      repo: 'git@github.com:hive-engine/defidojo-frontend.git',
      ssh_options: ['ForwardAgent=yes'],
      path: '/home/ubuntu/nodejs/frontend',
      'post-deploy': 'npm ci && npm run build && pm2 startOrRestart ecosystem.config.js --env production --update-env && pm2 save'
    }
  }
}
