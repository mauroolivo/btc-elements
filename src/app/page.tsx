import Link from 'next/link';

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-24 pb-10">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.14),transparent_35%),rgba(255,255,255,0.04)] p-8 backdrop-blur-sm sm:p-10">
        <div className="max-w-3xl">
          <div className="marketing-eyebrow text-cyan-200/80">
            Bitcoin Core UI
          </div>
          <h1 className="marketing-hero-title mt-4 text-white">
            Welcome to the Bitcoin Core UI.
          </h1>
          <p className="marketing-lead mt-5 max-w-2xl text-gray-200">
            Operate your node with the security posture of full validation, the
            observability of Bitcoin Core RPCs, and a single interface for
            wallet, mempool, explorer, and status workflows.
          </p>
          <p className="marketing-copy mt-4 max-w-2xl text-sm text-gray-300 sm:text-base">
            This workspace is designed around the same themes highlighted by
            Bitcoin Core itself: validate independently, preserve privacy, and
            stay close to the underlying node primitives instead of abstracting
            them away.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/wallet"
              className="inline-flex rounded-md border border-cyan-300/20 bg-cyan-400/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-400/20"
            >
              Open wallet
            </Link>
            <Link
              href="/status"
              className="inline-flex rounded-md border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
            >
              View node status
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
            Full validation
          </h2>
          <p className="marketing-copy mt-3 text-sm text-gray-300">
            Track the chain with a UI built around the same model as Bitcoin
            Core: every accepted block and transaction should be independently
            verified, not trusted by default.
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
            Privacy-aware operations
          </h2>
          <p className="marketing-copy mt-3 text-sm text-gray-300">
            Use wallet and node functions without losing sight of what the node
            is actually doing. The interface stays close to descriptors,
            balances, mempool state, and transaction details.
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
            Network support
          </h2>
          <p className="marketing-copy mt-3 text-sm text-gray-300">
            Monitor peer activity, sync progress, and operational health while
            participating in the network as a fully validating node rather than
            a passive client.
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
        <div className="max-w-3xl">
          <div className="marketing-eyebrow text-gray-400">RPC Surface</div>
          <h2 className="marketing-section-title mt-3 text-white">
            Built around the Bitcoin Core RPC model
          </h2>
          <p className="marketing-copy mt-4 text-sm text-gray-300 sm:text-base">
            The interface takes its shape from the major RPC domains exposed by
            Bitcoin Core: blockchain state, wallet actions, network visibility,
            raw transaction tooling, and operational controls.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="text-base font-semibold tracking-[-0.025em] text-white">
              Blockchain
            </div>
            <p className="marketing-copy mt-2 text-sm text-gray-300">
              Inspect tip state, headers, block data, chain work, and sync
              progress through the same information exposed by
              `getblockchaininfo` and related RPCs.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="text-base font-semibold tracking-[-0.025em] text-white">
              Wallet
            </div>
            <p className="marketing-copy mt-2 text-sm text-gray-300">
              Manage addresses, balances, unspent outputs, receive flows, send
              flows, fee bumping, and wallet lifecycle actions from one place.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="text-base font-semibold tracking-[-0.025em] text-white">
              Network & mempool
            </div>
            <p className="marketing-copy mt-2 text-sm text-gray-300">
              Observe peers, mempool pressure, relay fee thresholds, and node
              connectivity using the same categories documented in the RPC
              reference.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="text-base font-semibold tracking-[-0.025em] text-white">
              Raw transaction tooling
            </div>
            <p className="marketing-copy mt-2 text-sm text-gray-300">
              Keep low-level transaction workflows close by, from inspection and
              PSBT handling to broadcast and fee-sensitive verification.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Link
          href="/wallet"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10"
        >
          <div className="text-base font-semibold tracking-[-0.025em] text-white">
            Wallet
          </div>
          <p className="marketing-copy mt-2 text-sm text-gray-300">
            Move into address management, balances, receive requests, send
            flows, and transaction controls.
          </p>
        </Link>
        <Link
          href="/explorer"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10"
        >
          <div className="text-base font-semibold tracking-[-0.025em] text-white">
            Explorer
          </div>
          <p className="marketing-copy mt-2 text-sm text-gray-300">
            Inspect chain data and navigate blocks and transactions with a node
            connected view of the network.
          </p>
        </Link>
        <Link
          href="/mempool"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10"
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
  );
}
