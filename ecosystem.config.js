module.exports = {
  apps: [
    {
      name: 'server-monitor',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      merge_logs: true,
      // Restart policies
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true,
      // Graceful
      kill_timeout: 5000,
      listen_timeout: 8000,
    },
  ],
};
