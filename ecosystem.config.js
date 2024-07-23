module.exports = {
    apps : [{
      name: 'video-api',
      script: 'server.js',
      instances: 'max',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    }]
  };
