# BTC Elements

A Modern Web Interface for Bitcoin Core - Visual Companion to Learning Bitcoin from the Command Line

## Features

- **Wallet Management**: View balances, transaction history, receive and send Bitcoin, and manage addresses.
- **Transaction Details**: Inspect transaction details, including BIP125 Replace-by-Fee (RBF) support.
- **Replace-by-Fee (RBF)**: Easily bump transaction fees for replaceable transactions.
- **Blockchain Explorer**: Explore blocks, transactions, and mempool data.
- **Mempool Visualization**: View unconfirmed transactions and mempool statistics.
- **Help & Documentation**: Integrated help section for Bitcoin Core concepts.

## Tech Stack

- [Next.js 16](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/) (state management)
- [SWR](https://swr.vercel.app/) (data fetching)
- [Zod](https://zod.dev/) (schema validation)

## Getting Started

### Prerequisites

- Node.js 18+
- Bitcoin Core node (with RPC enabled)

### Installation

```bash
# Clone the repository
$ git clone https://github.com/yourusername/btc-elements.git
$ cd btc-elements

# Install dependencies
$ npm install
```

### Configuration

1. Copy your Bitcoin Core RPC credentials to an `.env` file:

```
PUBLIC_NODE_URL=http://192.168.1.XX:3000/bitcoin-proxy
PUBLIC_RPC_USER=your_rpc_user
PUBLIC_RPC_PASS=your_rpc_password
```

### Running the App

```bash
# Start the development server
$ npm run dev

# Open http://localhost:3000 in your browser
```

## CORS Issue & Proxy Setup

If you are accessing the Bitcoin Core node from another machine in a LAN, you need to run a simple proxy to fix the CORS issue. Here is an example using Node.js, Express, and http-proxy-middleware:

```js
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = 3000;

app.use(cors());

app.use(
  '/bitcoin-proxy',
  createProxyMiddleware({
    target: 'http://localhost:8332', // Bitcoin RPC endpoint
    changeOrigin: true,
    pathRewrite: {
      '^/bitcoin-proxy': '', // Remove /bitcoin-proxy prefix
    },
  })
);

app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
```

This proxy allows you to bypass CORS restrictions when connecting to your Bitcoin Core node from another device on your local network. Adjust the authentication and endpoint as needed for your setup.

## Project Structure

```
/ (root)
├── src/
│   ├── app/                # Next.js app directory (routing, pages)
│   │   └── (tree)/         # App routes: explorer, help, mempool, wallet
│   ├── bitcoin-core/       # Core wallet logic, API, components, models
│   │   ├── api/            # Bitcoin Core RPC API wrappers
│   │   ├── components/     # React UI components (Wallet, Explorer, etc.)
│   │   ├── model/          # TypeScript models & schemas
│   │   └── params.ts       # Network/config params
├── public/                 # Static assets
├── package.json            # Project metadata & scripts
├── next.config.ts          # Next.js config
├── tsconfig.json           # TypeScript config
└── README.md               # This file
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT

## Acknowledgments

- [Bitcoin Core](https://bitcoincore.org/)
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
