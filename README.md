# BTC Elements

BTC Elements is a Next.js interface for operating and inspecting a Bitcoin Core
node through a modern web UI. The application is centered on the same ideas
promoted by Bitcoin Core itself: full validation, privacy-aware operation,
network participation, and direct access to node functionality through Bitcoin
Core RPC concepts.

The home page introduces the product as a Bitcoin Core UI rather than a generic
dashboard. From there, users can move into wallet operations, node status,
exploration tools, mempool visibility, charts, and authenticated profile flows.

## What The App Covers

- **Home**: A landing page for the Bitcoin Core UI with direct entry points to wallet and node workflows.
- **Node Status**: Sync progress, chain state, mempool information, mining data, and network-level diagnostics.
- **Wallet**: Address management, send and receive flows, wallet connection state, transaction history, RBF, and CPFP-related actions.
- **Explorer**: Block and transaction inspection from the connected node.
- **Mempool**: Visibility into current mempool conditions and fee-related signals.
- **Chart**: BTC market charting through the CoinGecko route.
- **Profile**: Firebase-backed session and profile information for authenticated users.

## Design Direction

The UI is intentionally close to the underlying Bitcoin Core model instead of
hiding it behind generic abstractions. The product copy and route design are
inspired by:

- Bitcoin Core features such as full validation, better privacy, and network support.
- The Bitcoin Core RPC reference categories such as blockchain, wallet, network, raw transaction, control, and mining RPCs.

## Authentication

Firebase Authentication is integrated for user identity and profile access.
The app supports:

- Email and password sign in
- Email and password sign up
- Google sign in
- GitHub sign in

Successful authentication redirects the user to the home page. Profile details
are available under `/profile`.

## Tech Stack

- [Next.js 16](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [SWR](https://swr.vercel.app/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

## Prerequisites

- Node.js 18+
- A reachable Bitcoin Core node with RPC enabled
- A Firebase project configured for the authentication providers you want to use

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the project root and provide both Bitcoin Core RPC and
Firebase client configuration.

```dotenv
PUBLIC_NODE_URL=http://127.0.0.1:8332
PUBLIC_RPC_USER=your_rpc_user
PUBLIC_RPC_PASS=your_rpc_password

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Notes:

- The Firebase values are client-side configuration and must use `NEXT_PUBLIC_` prefixes.
- If you use Google or GitHub authentication, those providers must also be enabled in the Firebase console.
- GitHub authentication also requires the correct OAuth callback URL in the Firebase provider setup.

## Running The App

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Main Routes

- `/` Home landing page
- `/status` Node Status
- `/wallet` Wallet tools
- `/explorer` Explorer
- `/mempool` Mempool view
- `/chart` BTC chart
- `/help` Help content
- `/profile` Firebase profile page
- `/auth/signin` Sign in
- `/auth/signup` Sign up

## Project Structure

```text
src/
	app/
		globals.css
		layout.tsx
		page.tsx
		status/page.tsx
		profile/page.tsx
		auth/
			page.tsx
			signin/page.tsx
			signup/page.tsx
			_components/
		api/
			coin-gecko/route.ts
		(tree)/
			chart/page.tsx
			explorer/page.tsx
			help/page.tsx
			mempool/page.tsx
			wallet/page.tsx
	bitcoin-core/
		api/
		components/
		model/
		constants.ts
		params.ts
		useWalletStore.ts
	components/
		auth/
	lib/
		firebase/
```

## Development Notes

- The app router handles page routing and shared layout composition.
- Firebase auth state is provided globally through an auth provider mounted in the root layout.
- Forms follow the `react-hook-form` plus `zod` validation pattern used across the codebase.
- The UI is designed to stay close to Bitcoin Core data rather than presenting a generic crypto wallet abstraction.

## License

MIT
