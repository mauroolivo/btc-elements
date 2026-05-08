import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import { useWalletStore } from '@features/wallet/store';
import {
  Getbalance,
  Getwalletinfo,
  Getaddressinfo,
  Getdescriptorinfo,
  Getrawchangeaddress,
  Listaddressgroupings,
  Listtransactions,
  Listunspent,
  Listwalletdir,
  Listwallets,
} from '@features/wallet/types/wallet';
import {
  getaddressinfo as rpcGetAddressInfo,
  getbalance as rpcGetBalance,
  getdescriptorinfo as rpcGetDescriptorInfo,
  getrawchangeaddress,
  getwalletinfo,
  listaddressgroupings as rpcListAddressGroupings,
  listtransactions,
  listUnspent,
  listwalletdir,
  listwallets,
} from '@shared/lib/bitcoin-rpc/api';

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

export function useWalletInfo() {
  const currentWallet = useWalletStore((state) => state.currentWallet);
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

export function useBalance() {
  const currentWallet = useWalletStore((state) => state.currentWallet);
  const shouldFetch = currentWallet !== null;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['getbalance', currentWallet] : null,
    () => rpcGetBalance(currentWallet as string),
    { revalidateOnFocus: false }
  );
  return {
    balanceInfo: (data as Getbalance) ?? null,
    error,
    isLoading,
    refresh: () => mutate(),
  };
}

export function useTransactions(options?: {
  label?: string;
  pageSize?: number;
  include_watchonly?: boolean;
}) {
  const currentWallet = useWalletStore((state) => state.currentWallet);
  const label = options?.label ?? '*';
  const pageSize = options?.pageSize ?? 5;
  const includeWatchonly = options?.include_watchonly ?? true;

  const getKey = (
    pageIndex: number,
    previousPageData: Listtransactions | null
  ) => {
    if (currentWallet === null) return null;
    if (previousPageData && previousPageData.result.length < pageSize) {
      return null;
    }
    return [
      'listtransactions',
      currentWallet,
      label,
      pageSize,
      pageIndex * pageSize,
      includeWatchonly,
    ];
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<Listtransactions>(
      getKey,
      async ([, wallet, itemLabel, count, skip, watch]) =>
        await listtransactions(
          wallet as string,
          itemLabel as string,
          count as number,
          skip as number,
          watch as boolean
        ),
      { revalidateOnFocus: false }
    );

  const pages = data ?? [];
  const transactions = pages.flatMap((page) => page.result);
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

export function useUnspent() {
  const currentWallet = useWalletStore((state) => state.currentWallet);
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

export function useAddressGroupings() {
  const currentWallet = useWalletStore((state) => state.currentWallet);
  const shouldFetch = currentWallet !== null;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['listaddressgroupings', currentWallet] : null,
    () => rpcListAddressGroupings(currentWallet as string),
    { revalidateOnFocus: false }
  );
  return {
    groupings: (data as Listaddressgroupings) ?? null,
    error,
    isLoading,
    refresh: () => mutate(),
  };
}

export function useAddressInfo(address: string | null | undefined) {
  const currentWallet = useWalletStore((state) => state.currentWallet);
  const shouldFetch = !!address && address.length > 0 && currentWallet !== null;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['getaddressinfo', currentWallet, address] : null,
    () => rpcGetAddressInfo(address as string, currentWallet as string),
    { revalidateOnFocus: false }
  );
  return {
    addressInfo: (data as Getaddressinfo) ?? null,
    error,
    isLoading,
    refresh: () => mutate(),
  };
}

export function useDescriptorInfo(descriptor: string | null | undefined) {
  const currentWallet = useWalletStore((state) => state.currentWallet);
  const shouldFetch =
    !!descriptor && descriptor.length > 0 && currentWallet !== null;
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['getdescriptorinfo', currentWallet, descriptor] : null,
    () => rpcGetDescriptorInfo(descriptor as string, currentWallet as string),
    { revalidateOnFocus: false }
  );
  return {
    descriptorInfo: (data as Getdescriptorinfo) ?? null,
    error,
    isLoading,
    refresh: () => mutate(),
  };
}

export function useChangeAddress() {
  const currentWallet = useWalletStore((state) => state.currentWallet);
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