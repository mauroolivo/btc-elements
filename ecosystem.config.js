module.exports = {
  apps: [
    {
      name: 'btc-elements',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      interpreter: process.env.NODE_BINARY || process.execPath,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
