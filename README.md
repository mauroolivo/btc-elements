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

## Project Structure

This project uses the Next.js app router and keeps Bitcoin-related logic inside `src/bitcoin-core`.

```
/(root)
├── src/
│   ├── app/                        # Next.js app directory (routes & UI pages)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── (tree)/                  # Feature routes
│   │       ├── chart/page.tsx       # BTC price chart page (ChartCoinGecko)
│   │       ├── explorer/page.tsx
│   │       ├── help/page.tsx
│   │       ├── mempool/page.tsx
│   │       └── wallet/page.tsx
│   ├── app/api/                     # Server (Edge / Route) API endpoints
│   │   └── coin-gecko/route.ts      # Proxy to CoinGecko for price history
│   └── bitcoin-core/                # Bitcoin Core domain code and UI primitives
│       ├── constants.ts
│       ├── params.ts
│       ├── useWalletStore.ts
│       ├── api/
│       │   └── api.ts               # RPC helpers and client wrappers
│       ├── components/              # React components (Header, Wallet, Chart, etc.)
│       │   ├── Header.tsx
│       │   ├── ThemeSelector.tsx
│       │   ├── ChartCoinGecko.tsx   # Chart component used by /chart
│       │   └── Wallet/              # Wallet-related components and subfolders
│       └── model/                   # TypeScript models & domain types
│           ├── block.ts
│           ├── blockchain.ts
│           ├── forms.ts
│           ├── help.ts
│           ├── transaction.ts
│           └── wallet.ts
├── public/                          # Static assets
├── package.json                     # Project metadata & scripts
├── next.config.ts                   # Next.js configuration
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # This file
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
