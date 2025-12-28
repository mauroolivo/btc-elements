import useSWR from 'swr';
import {
  getrawtransaction,
  getblock,
  getblockhash,
} from '@/bitcoin-core/api/api';
import { Getrawtransaction } from '@/bitcoin-core/model/transaction';
import { Getblock, Getblockhash } from '@/bitcoin-core/model/block';

export function useRawTransaction(
  txid?: string,
  options?: { verbose?: boolean; revalidateOnFocus?: boolean }
) {
  const verbose = options?.verbose ?? true;
  const revalidateOnFocus = options?.revalidateOnFocus ?? false;
  const shouldFetch = !!txid;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['getrawtransaction', txid, verbose] : null,
    () => getrawtransaction(txid as string, verbose),
    { revalidateOnFocus }
  );

  const response = (data as Getrawtransaction) ?? null;
  const rpcError = response?.error ?? null;
  return {
    raw: rpcError ? null : response,
    error: error ?? rpcError ?? null,
    isLoading,
    refresh: () => mutate(),
  };
}

export function useBlock(
  blockid?: string,
  options?: { verbosity?: number; revalidateOnFocus?: boolean }
) {
  const verbosity = options?.verbosity ?? 1;
  const revalidateOnFocus = options?.revalidateOnFocus ?? false;
  const shouldFetch = !!blockid;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['getblock', blockid, verbosity] : null,
    () => getblock(blockid as string, verbosity),
    { revalidateOnFocus }
  );

  const response = (data as Getblock) ?? null;
  const rpcError = response?.error ?? null;
  return {
    block: rpcError ? null : response,
    error: error ?? rpcError ?? null,
    isLoading,
    refresh: () => mutate(),
  };
}

export function useBlockByHeight(
  height?: number,
  options?: { verbosity?: number; revalidateOnFocus?: boolean }
) {
  const verbosity = options?.verbosity ?? 1;
  const revalidateOnFocus = options?.revalidateOnFocus ?? false;
  const shouldFetch = typeof height === 'number' && height >= 0;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['getblock-by-height', height, verbosity] : null,
    async () => {
      const bh = (await getblockhash(height as number)) as Getblockhash;
      if (bh?.error)
        throw new Error(bh.error.message ?? 'RPC error: getblockhash');
      return getblock(bh.result, verbosity);
    },
    { revalidateOnFocus }
  );

  const response = (data as Getblock) ?? null;
  const rpcError = response?.error ?? null;
  return {
    block: rpcError ? null : response,
    error: error ?? rpcError ?? null,
    isLoading,
    refresh: () => mutate(),
  };
}
