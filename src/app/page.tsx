'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/useAuth';
import { useWalletStore } from '@/bitcoin-core/useWalletStore';
import {
  useCreateWallet,
  useWalletsDir,
} from '@/bitcoin-core/components/Wallet/hooks';
import { getUserWallets } from '@/lib/firebase/wallets';

const DEMO_ACCOUNT_EMAIL = 'demo@btccore.io';

export default function Page() {
  const router = useRouter();
  const { user, login } = useAuth();
  const { setTargetWallet } = useWalletStore();
  const { create: createRpcWallet } = useCreateWallet();
  const { listwalletdir, refresh: refreshWalletDir } = useWalletsDir();
  const [isDemoOpening, setIsDemoOpening] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [blockedDemoAccount, setBlockedDemoAccount] = useState<string | null>(
    null
  );

  async function openDemoWalletForUser(userId: string) {
    const wallets = await getUserWallets(userId);

    if (wallets.length === 0 || !wallets[0].id) {
      setDemoError('Demo wallet is not available right now.');
      return;
    }

    const walletId = wallets[0].id;
    const walletExistsInCore = listwalletdir.result.wallets.some(
      (wallet) => wallet.name === walletId
    );

    if (!walletExistsInCore) {
      const created = await createRpcWallet(walletId);

      if (created?.error) {
        const rpcErrorText = JSON.stringify(created.error).toLowerCase();

        if (!rpcErrorText.includes('already exists')) {
          setDemoError('Demo wallet is not available right now.');
          return;
        }
      }

      await refreshWalletDir();
    }

    setTargetWallet(walletId);
    router.push('/wallet');
  }

  async function handleOpenDemoWallet() {
    if (user) {
      const authenticatedEmail = user.email?.toLowerCase();

      if (authenticatedEmail === DEMO_ACCOUNT_EMAIL) {
        setIsDemoOpening(true);
        setDemoError(null);

        try {
          await openDemoWalletForUser(user.uid);
        } finally {
          setIsDemoOpening(false);
        }

        return;
      }

      if (authenticatedEmail !== DEMO_ACCOUNT_EMAIL) {
        const accountLabel = user.email ?? 'an unknown account';

        setBlockedDemoAccount(accountLabel);
        return;
      }
    }

    setIsDemoOpening(true);
    setDemoError(null);

    try {
      const credentialsResponse = await fetch('/api/demo-credentials', {
        cache: 'no-store',
      });

      if (!credentialsResponse.ok) {
        return;
      }

      const credentials = (await credentialsResponse.json()) as {
        email?: string;
        password?: string;
      };

      if (!credentials.email || !credentials.password) {
        return;
      }

      const signInResult = await login(credentials.email, credentials.password);
      await openDemoWalletForUser(signInResult.user.uid);
    } catch {
      // Silent fail by request.
    } finally {
      setIsDemoOpening(false);
    }
  }

  return (
    <>
      {blockedDemoAccount ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-account-dialog-title"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-200/16 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.94))] p-6 text-white shadow-[0_24px_80px_rgba(2,8,23,0.56)]"
          >
            <h2
              id="demo-account-dialog-title"
              className="mt-4 text-xl font-semibold tracking-[-0.03em] text-white"
            >
              Demo wallet is reserved for the demo login
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              You&apos;re currently logged in as{' '}
              <span className="font-semibold text-amber-100">
                {blockedDemoAccount}
              </span>
              . Please log out first if you want to access the one-click demo
              wallet.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setBlockedDemoAccount(null)}
                className="inline-flex items-center rounded-2xl border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-6 pt-24 pb-10">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.14),transparent_35%),rgba(255,255,255,0.04)] p-8 backdrop-blur-sm sm:p-10 lg:min-h-108">
          <div className="max-w-3xl lg:max-w-[calc(100%-25rem)] lg:pr-8">
            <div className="marketing-eyebrow text-cyan-200/80">
              Bitcoin Core UI
            </div>
            <h1 className="marketing-hero-title mt-4 text-white">
              Welcome to the Bitcoin Core UI.
            </h1>
            <p className="marketing-lead mt-5 max-w-2xl text-gray-200">
              Operate your node with the security posture of full validation,
              the observability of Bitcoin Core RPCs, and a single interface for
              wallet, mempool, explorer, and status workflows.
            </p>
            <p className="marketing-copy mt-4 max-w-2xl text-sm text-gray-300 sm:text-base">
              This workspace is designed around the same themes highlighted by
              Bitcoin Core itself: validate independently, preserve privacy, and
              stay close to the underlying node primitives instead of
              abstracting them away.
            </p>

            <div className="relative mt-8 max-w-2xl overflow-hidden rounded-[28px] border border-amber-300/18 bg-[linear-gradient(135deg,rgba(250,204,21,0.14),rgba(56,189,248,0.08)_52%,rgba(255,255,255,0.04))] p-5 shadow-[0_20px_50px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm lg:absolute lg:top-10 lg:right-10 lg:mt-0 lg:max-w-sm">
              <div className="pointer-events-none absolute top-6 right-[-2.1rem] w-44 rotate-45 border-y border-cyan-50/30 bg-[linear-gradient(180deg,rgba(34,211,238,0.96),rgba(8,145,178,0.84))] py-2 text-center text-xs font-bold tracking-[0.18em] text-slate-950 uppercase shadow-[0_14px_32px_rgba(8,145,178,0.28)]">
                testnet4
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.24em] text-amber-100/75 uppercase">
                  Network disclaimer
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                  This UI works on{' '}
                  <span className="font-semibold tracking-[-0.02em] text-cyan-100">
                    testnet4
                  </span>{' '}
                  coins.
                </h2>
                <p className="mt-3 text-sm leading-6 text-cyan-50/80">
                  Funds and addresses shown here are for Bitcoin{' '}
                  <span className="font-semibold text-cyan-100">testnet4</span>,
                  not mainnet. Testnet3 is being deprecated, so this workspace
                  is already moving with the next wave of public testing.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 lg:flex-nowrap">
              <Link
                href="/my-wallets"
                className="inline-flex items-center rounded-2xl border border-cyan-200/25 bg-[linear-gradient(180deg,rgba(56,189,248,0.42),rgba(14,165,233,0.22))] px-6 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-[0_14px_34px_rgba(14,165,233,0.22),inset_0_1px_0_rgba(255,255,255,0.16)] transition-all hover:bg-[linear-gradient(180deg,rgba(56,189,248,0.5),rgba(14,165,233,0.28))]"
              >
                My Wallets
              </Link>

              <button
                type="button"
                onClick={() => void handleOpenDemoWallet()}
                disabled={isDemoOpening}
                className="inline-flex items-center gap-2 rounded-2xl border border-amber-300/40 bg-[linear-gradient(180deg,rgba(245,158,11,0.92),rgba(251,146,60,0.82))] px-7 py-3 text-base font-extrabold whitespace-nowrap text-slate-950 shadow-[0_16px_40px_rgba(245,158,11,0.35),inset_0_1px_0_rgba(255,255,255,0.34)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDemoOpening ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    Connecting...
                  </>
                ) : (
                  '👉 One Click Demo Wallet'
                )}
              </button>

              <div className="inline-flex items-center gap-2 px-1 py-2 text-sm font-medium text-emerald-100/90 lg:ml-1 lg:whitespace-nowrap">
                <span className="core-live-dot" />
                Connected to Bitcoin Core 31.0
              </div>
            </div>

            {demoError ? (
              <p className="mt-4 text-sm font-semibold text-red-300">
                {demoError}
              </p>
            ) : null}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <article className="core-surface rounded-2xl p-6">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
              Full validation
            </h2>
            <p className="marketing-copy mt-3 text-sm text-gray-300">
              Track the chain with a UI built around the same model as Bitcoin
              Core: every accepted block and transaction should be independently
              verified, not trusted by default.
            </p>
          </article>

          <article className="core-surface rounded-2xl p-6">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
              Privacy-aware operations
            </h2>
            <p className="marketing-copy mt-3 text-sm text-gray-300">
              Use wallet and node functions without losing sight of what the
              node is actually doing. The interface stays close to descriptors,
              balances, mempool state, and transaction details.
            </p>
          </article>

          <article className="core-surface rounded-2xl p-6">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
              Network support
            </h2>
            <p className="marketing-copy mt-3 text-sm text-gray-300">
              Monitor peer activity, sync progress, and operational health while
              participating in the network as a fully validating node rather
              than a passive client.
            </p>
          </article>
        </section>

        <section className="core-surface mt-8 rounded-3xl p-8">
          <div className="max-w-3xl">
            <div className="marketing-eyebrow text-gray-400">RPC Surface</div>
            <h2 className="marketing-section-title mt-3 text-white">
              Built around the Bitcoin Core RPC model
            </h2>
            <p className="marketing-copy mt-4 text-sm text-gray-300 sm:text-base">
              The interface takes its shape from the major RPC domains exposed
              by Bitcoin Core: blockchain state, wallet actions, network
              visibility, raw transaction tooling, and operational controls.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="core-panel-muted rounded-2xl p-5">
              <div className="text-base font-semibold tracking-[-0.025em] text-white">
                Blockchain
              </div>
              <p className="marketing-copy mt-2 text-sm text-gray-300">
                Inspect tip state, headers, block data, chain work, and sync
                progress through the same information exposed by
                `getblockchaininfo` and related RPCs.
              </p>
            </div>
            <div className="core-panel-muted rounded-2xl p-5">
              <div className="text-base font-semibold tracking-[-0.025em] text-white">
                Wallet
              </div>
              <p className="marketing-copy mt-2 text-sm text-gray-300">
                Manage addresses, balances, unspent outputs, receive flows, send
                flows, fee bumping, and wallet lifecycle actions from one place.
              </p>
            </div>
            <div className="core-panel-muted rounded-2xl p-5">
              <div className="text-base font-semibold tracking-[-0.025em] text-white">
                Network & mempool
              </div>
              <p className="marketing-copy mt-2 text-sm text-gray-300">
                Observe peers, mempool pressure, relay fee thresholds, and node
                connectivity using the same categories documented in the RPC
                reference.
              </p>
            </div>
            <div className="core-panel-muted rounded-2xl p-5">
              <div className="text-base font-semibold tracking-[-0.025em] text-white">
                Raw transaction tooling
              </div>
              <p className="marketing-copy mt-2 text-sm text-gray-300">
                Keep low-level transaction workflows close by, from inspection
                and PSBT handling to broadcast and fee-sensitive verification.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Link
            href="/my-wallets"
            className="core-surface rounded-2xl p-6 transition-colors hover:bg-white/8"
          >
            <div className="text-base font-semibold tracking-[-0.025em] text-white">
              My Wallets
            </div>
            <p className="marketing-copy mt-2 text-sm text-gray-300">
              Open your wallet list, create new wallets, and jump directly into
              a connected wallet view.
            </p>
          </Link>
          <Link
            href="/explorer"
            className="core-surface rounded-2xl p-6 transition-colors hover:bg-white/8"
          >
            <div className="text-base font-semibold tracking-[-0.025em] text-white">
              Explorer
            </div>
            <p className="marketing-copy mt-2 text-sm text-gray-300">
              Inspect chain data and navigate blocks and transactions with a
              node connected view of the network.
            </p>
          </Link>
          <Link
            href="/mempool"
            className="core-surface rounded-2xl p-6 transition-colors hover:bg-white/8"
          >
            <div className="text-base font-semibold tracking-[-0.025em] text-white">
              Mempool
            </div>
            <p className="marketing-copy mt-2 text-sm text-gray-300">
              Review transaction pressure, memory usage, and fee-related signals
              before taking wallet actions.
            </p>
          </Link>
        </section>
      </div>
    </>
  );
}
