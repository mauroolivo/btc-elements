import { create } from 'zustand';
import useSWR, { mutate as swrMutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import useSWRInfinite from 'swr/infinite';

import {
  Getwalletinfo,
  Listtransactions,
  Listwalletdir,
  Listwallets,
  Newaddress,
  Sendtoaddress,
  Listunspent,
  Getrawchangeaddress,
} from '@/bitcoin-core/model/wallet';
import {
  listwalletdir,
  listwallets,
  loadwallet,
  unloadwallet,
  getwalletinfo,
  listtransactions,
  getnewaddress,
  sendtoaddress,
  listUnspent,
  getrawchangeaddress,
  createrawtransaction,
  signrawtransactionwithwallet,
  sendrawtransaction,
} from '@/bitcoin-core/api/api';
import { ParamsDictionary } from '@/bitcoin-core/params';

export type WalletState = {
  currentWallet: string | null;
  setCurrentWallet: (wallet: string) => void;
};

export const useWalletStore = create<WalletState>((set) => ({
  currentWallet: null,
  setCurrentWallet: (wallet: string) => {
    set({ currentWallet: wallet });
  },
}));

// SWR hooks for wallet directory and loaded wallets
export function useWalletsDir() {
  const { data, error, isLoading, mutate } = useSWR(
    'listwalletdir',
    () => listwalletdir(),
    { revalidateOnFocus: false }
  );
  return {
    listwalletdir: (data as Listwalletdir) ?? {
      result: { wallets: [] },
      error: null,
      id: '',
    },
    error,
    isLoading,
    refresh: () => mutate(),
  };
}

export function useWalletsList() {
  const { data, error, isLoading, mutate } = useSWR(
    'listwallets',
    () => listwallets(),
    { revalidateOnFocus: false }
  );
  return {
    listwallets: (data as Listwallets) ?? { result: [], error: null, id: '' },
    error,
    isLoading,
    refresh: () => mutate(),
  };
}

// SWR hook for wallet info based on currentWallet from the store
export function useWalletInfo() {
  const currentWallet = useWalletStore((s) => s.currentWallet);
  const shouldFetch = currentWallet !== null;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['getwalletinfo', currentWallet] : null,
    () => getwalletinfo(currentWallet as string),
    { revalidateOnFocus: false }
  );
  return {
    walletInfo: (data as Getwalletinfo) ?? null,
    error,
    isLoading,
    refresh: () => mutate(),
  };
}

// SWR mutation hooks for load/unload wallet actions
export function useLoadWallet() {
  const { trigger, isMutating, error } = useSWRMutation(
    'loadwallet',
    async (_key, { arg }: { arg: string }) => {
      await loadwallet(arg);
      await swrMutate('listwallets');
    }
  );
  return {
    load: (wallet: string) => trigger(wallet),
    isLoading: isMutating,
    error,
  };
}

export function useUnloadWallet() {
  const { trigger, isMutating, error } = useSWRMutation(
    'unloadwallet',
    async (_key, { arg }: { arg: string }) => {
      await unloadwallet(arg);
      await swrMutate('listwallets');
    }
  );
  return {
    unload: (wallet: string) => trigger(wallet),
    isLoading: isMutating,
    error,
  };
}

// SWR mutation hook to generate a new receiving address
export function useNewAddress() {
  const currentWallet = useWalletStore((s) => s.currentWallet);
  const { trigger, data, error, isMutating } = useSWRMutation(
    'getnewaddress',
    async (_key, { arg }: { arg: { wallet: string; addressType: string } }) => {
      return getnewaddress(arg.wallet, arg.addressType);
    }
  );
  return {
    response: (data as Newaddress) ?? null,
    error,
    isLoading: isMutating,
    generate: (addressType: string) => {
      if (currentWallet === undefined || currentWallet === null)
        throw new Error('No wallet selected');
      return trigger({ wallet: currentWallet, addressType });
    },
  };
}

// SWR mutation hook to send to address (submit transaction)
export function useSendtoaddress() {
  const currentWallet = useWalletStore((s) => s.currentWallet);
  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    'sendtoaddress',
    async (
      _key,
      { arg }: { arg: { wallet: string; payload: ParamsDictionary } }
    ) => {
      return sendtoaddress(arg.payload, arg.wallet);
    }
  );
  return {
    response: (data as Sendtoaddress) ?? null,
    error,
    isLoading: isMutating,
    send: (payload: ParamsDictionary) => {
      if (currentWallet === undefined || currentWallet === null)
        throw new Error('No wallet selected');
      return trigger({ wallet: currentWallet, payload });
    },
    clear: () => {
      reset();
    },
  };
}

// SWR Infinite hook for transactions with pagination
export function useTransactions(options?: {
  label?: string;
  pageSize?: number;
  include_watchonly?: boolean;
}) {
  const currentWallet = useWalletStore((s) => s.currentWallet);
  const label = options?.label ?? '*';
  const pageSize = options?.pageSize ?? 5;
  const include_watchonly = options?.include_watchonly ?? true;

  const getKey = (
    pageIndex: number,
    previousPageData: Listtransactions | null
  ) => {
    if (currentWallet === null) return null;
    if (previousPageData && previousPageData.result.length < pageSize)
      return null;
    return [
      'listtransactions',
      currentWallet,
      label,
      pageSize,
      pageIndex * pageSize,
      include_watchonly,
    ];
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<Listtransactions>(
      getKey,
      async ([, wallet, lbl, count, skip, watch]) =>
        await listtransactions(
          wallet as string,
          lbl as string,
          count as number,
          skip as number,
          watch as boolean
        ),
      { revalidateOnFocus: false }
    );

  const pages = data ?? [];
  const transactions = pages.flatMap((p) => p.result);
  const hasMore =
    pages.length === 0
      ? false
      : pages[pages.length - 1].result.length === pageSize;

  return {
    pages,
    transactions,
    error,
    isLoading,
    isValidating,
    hasMore,
    loadMore: () => setSize(size + 1),
    refresh: () => mutate(),
    reset: () => setSize(0),
  };
}

// SWR hook to fetch unspent outputs (UTXOs)
export function useUnspent() {
  const currentWallet = useWalletStore((s) => s.currentWallet);
  const shouldFetch = currentWallet !== null;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['listunspent', currentWallet] : null,
    () => listUnspent(currentWallet as string),
    { revalidateOnFocus: false }
  );
  return {
    listunspent: (data as Listunspent) ?? { result: [], error: null, id: '' },
    error,
    isLoading,
    refresh: () => mutate(),
  };
}

// SWR hook to fetch change address (raw change address)
export function useChangeAddress() {
  const currentWallet = useWalletStore((s) => s.currentWallet);
  const shouldFetch = currentWallet !== null;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['getrawchangeaddress', currentWallet] : null,
    () => getrawchangeaddress(currentWallet as string),
    { revalidateOnFocus: false }
  );
  const response = (data as Getrawchangeaddress) ?? null;
  return {
    changeAddress: response?.result ?? '',
    error,
    isLoading,
    refresh: () => mutate(),
  };
}


export function useSendAdvanced() {
  const currentWallet = useWalletStore((s) => s.currentWallet);
  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    'send-advanced',
    async (
      _key,
      { arg }: { arg: { wallet: string; payload: ParamsDictionary } }
    ) => {
      const { wallet, payload } = arg;
      const res1 = await createrawtransaction(payload, wallet);
      console.log('createrawtransaction result:', res1);
      const signPayload: ParamsDictionary = { hexstring: res1.result ?? '' };
      const res2 = await signrawtransactionwithwallet(signPayload, wallet);
      console.log('signrawtransactionwithwallet result:', res2);

      const res3 = await sendrawtransaction({ hexstring: res2.result?.hex ?? '' }, wallet);
      console.log('sendrawtransaction result:', res3);
      const txid = res3.result ?? '';
      return txid;
    }
  );
  return {
    result: (data as string) ?? null,
    error,
    isLoading: isMutating,
    run: (payload: ParamsDictionary) => {
      if (currentWallet === undefined || currentWallet === null)
        throw new Error('No wallet selected');
      return trigger({ wallet: currentWallet, payload });
    },
    clear: () => {
      reset();
    },
  };
}
