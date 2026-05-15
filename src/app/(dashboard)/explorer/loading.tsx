import { ExplorerLoadingView } from './_components/ExplorerLoadingView';

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-24 pb-8 sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-screen-2xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold text-white">
          Transaction and Blocks Explorer
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Lookup a transaction by its TxID or a block by its hash or height.
        </p>
      </div>

      <div className="mx-auto w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        <ExplorerLoadingView
          title="Fetching explorer data"
          description="Checking the transaction and block references against your node..."
        />
      </div>
    </div>
  );
}
