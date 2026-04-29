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
        PUBLIC_NODE_URL: process.env.PUBLIC_NODE_URL,
        PUBLIC_RPC_USER: process.env.PUBLIC_RPC_USER,
        PUBLIC_RPC_PASS: process.env.PUBLIC_RPC_PASS,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID:
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
          process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
          process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
          process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
        NEXT_PUBLIC_DEMO_EMAIL: process.env.NEXT_PUBLIC_DEMO_EMAIL,
        DEMO_PASSWORD: process.env.DEMO_PASSWORD,
      },
    },
  ],
};
