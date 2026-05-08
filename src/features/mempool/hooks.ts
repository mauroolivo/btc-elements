import useSWR from 'swr';
import { getRawmempool } from '@shared/lib/bitcoin-rpc/api';
import { Rawmempool } from '@shared/types/transaction';

export function useRawmempool(options?: {
  verbose?: boolean;
  revalidateOnFocus?: boolean;
  shouldFetch?: boolean;
}) {
  const verbose = options?.verbose ?? true;
  const revalidateOnFocus = options?.revalidateOnFocus ?? false;
  const shouldFetch = options?.shouldFetch ?? true;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['getrawmempool', verbose] : null,
    () => getRawmempool(verbose),
    { revalidateOnFocus }
  );

  const response = (data as Rawmempool) ?? null;
  const rpcError = response?.error ?? null;
  return {
    mempool: rpcError ? null : response,
    error: error ?? rpcError ?? null,
    isLoading,
    refresh: () => mutate(),
  };
}
