---
description: 'Use when working on BTC Elements architecture, layer boundaries, feature ownership, shared modules, SWR or Zustand usage, or Bitcoin Core product wording.'
applyTo: 'src/**, .github/copilot-instructions.md, README.md, eslint.config.mjs, tsconfig.json'
---

# BTC Elements Project Guidelines

## Architecture

- Treat this as a layered Next.js App Router project: `src/app` is the routing layer, `src/features` owns domain behavior, and `src/shared` is only for truly cross-feature infrastructure, types, and UI.
- Keep route-specific UI in `src/app/**/_components`. If a component is only used by one route, keep it in the app layer instead of moving it into a feature.
- Keep reusable domain logic inside the owning feature. Do not place feature-owned types, config, hooks, or UI in `shared` just because they are important.
- `src/shared` must not depend on `src/app`. Feature code must not import from the app layer.
- Prefer feature-owned adapters around persistence or external services instead of importing low-level infrastructure directly into route files.

## Imports And Aliases

- Use the configured aliases consistently: `@/*`, `@app/*`, `@features/*`, and `@shared/*`.
- Inside `src`, do not import app, feature, or shared modules through `@/app/*`, `@/features/*`, or `@/shared/*`. Use the explicit layer aliases instead.
- Follow the ESLint-enforced layer boundaries when moving code across folders.

## Feature Conventions

- Follow the existing feature structure when extending a domain: colocate components, hooks, schemas, store modules, config, and types inside the feature.
- Keep route pages focused on composition, state wiring, and data orchestration. Move large view fragments or parsing helpers into route-local modules when pages start growing.
- Avoid broad folder churn during refactors. Extend the existing feature shape unless there is a clear structural problem.

## State And Data Flow

- Follow the existing `react-hook-form` plus `zod` pattern for forms.
- Use SWR for remote data fetching patterns already established in features.
- Use the wallet Zustand store only for wallet-level session state; avoid expanding global state when local state or SWR is sufficient.
- When introducing `useReducer`, follow the existing reducer style in this repo: explicit action unions, pure reducers, and `immer` for nested state updates when it improves clarity.
- When introducing `use(promise)`, match the status page pattern: create promises in the route or server boundary, pass them down intentionally, and resolve them only at the suspense boundary that actually needs the data.

## Product Direction

- Preserve the product framing as a Bitcoin Core UI, not a generic crypto dashboard.
- Keep terminology aligned with Bitcoin Core and RPC concepts where the existing UI already does so.
- Prefer naming, labels, and help text that reflect node, wallet, mempool, block, and RPC concepts rather than generic crypto wording.
