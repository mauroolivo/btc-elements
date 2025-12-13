import { getbalance, getblockchaininfo } from '@/node-api/calls';
import { getrawtransaction } from '@/node-api/calls';
import { listwalletdir } from '@/node-api/calls';
import { listwallets } from '@/node-api/calls';
import { Wallet } from '@/node-api/Wallet';
import { WalletConnect } from '@/node-api/WalletConnect';

export default async function Page() {
  const blockchainInfo = await getblockchaininfo();

  const tx = await getrawtransaction(
    '64e736a94129b00bf521851ecf8f85cd9ea784eba9901b155a0fabc45f989912',
    true
  );
  const walletsDir = await listwalletdir();
  const listWallets = await listwallets();
  const balance = await getbalance('fabric');
  return (
    <div>
      <Wallet />
      <WalletConnect />
      <h1 className="mb-4 text-2xl font-semibold">Bitcoin Core Info</h1>
      <pre className="rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100">
        {JSON.stringify(blockchainInfo, null, 2)}
      </pre>
      <h2 className="my-4 text-xl font-semibold">Transaction Info</h2>
      <pre className="rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100">
        {JSON.stringify(tx, null, 2)}
      </pre>
      <h2 className="my-4 text-xl font-semibold">Wallets Directory</h2>
      <pre className="rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100">
        {JSON.stringify(walletsDir, null, 2)}
      </pre>
      <h2 className="my-4 text-xl font-semibold">List of Wallets</h2>
      <pre className="rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100">
        {JSON.stringify(listWallets, null, 2)}
      </pre>
      <h2 className="my-4 text-xl font-semibold">Balance</h2>
      <pre className="rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100">
        {JSON.stringify(balance, null, 2)}
      </pre>
    </div>
  );
}
