module.exports = {
  apps: [
    {
      name: 'server',
      script: 'server.js',  // Nome do arquivo principal da sua aplicação
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
