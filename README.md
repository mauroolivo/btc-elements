# BTC Elements

BTC Elements is a Next.js interface for operating and inspecting a Bitcoin Core
node through a modern web UI. It stays close to Bitcoin Core concepts such as
node status, wallet operations, mempool visibility, block exploration, and RPC-
oriented workflows.

## Features

- Home landing page for the Bitcoin Core UI
- Node status, sync, chain, and mining diagnostics
- Wallet flows for addresses, send, receive, history, RBF, and CPFP
- Explorer and mempool views backed by the connected node
- Firebase-backed authentication and profile access

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Firebase Authentication
- SWR, Zustand, React Hook Form, and Zod

## Setup

Prerequisites:

- Node.js 18+
- A reachable Bitcoin Core node with RPC enabled
- A Firebase project with the required auth providers enabled

Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Create a `.env` file in the project root:

```dotenv
PUBLIC_NODE_URL=http://127.0.0.1:48332
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

This project is currently aimed at Bitcoin Core on testnet4. If your node runs
with `-testnet4`, the default RPC port is `48332`.

`NEXT_PUBLIC_` variables are required for Firebase client configuration. If you
use Google or GitHub sign-in, enable those providers in Firebase and configure
their callback settings.

## Main Routes

- `/`
- `/status`
- `/wallet`
- `/explorer`
- `/mempool`
- `/chart`
- `/help`
- `/profile`
- `/auth/signin`
- `/auth/signup`

## Project Layout

```text
src/
  app/        Next.js routes, layouts, and API handlers
  features/   Domain features such as auth, wallet, mempool, and explorer
  shared/     Shared infrastructure, types, and UI
  lib/        External service integrations
```

## Accessibility Checks

This project runs runtime accessibility checks in development with
`@axe-core/react`.

- Triggered automatically when running `npm run dev`
- Runs only in development mode (`NODE_ENV=development`)
- Reports violations in the browser console while you interact with pages,
  dialogs, and forms

Static accessibility linting is also enabled through ESLint with
`eslint-plugin-jsx-a11y`.

## License

MIT
