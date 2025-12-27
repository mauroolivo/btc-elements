import useSWR from 'swr';
import { getrawtransaction } from '@/bitcoin-core/api/api';
import { Getrawtransaction } from '@/bitcoin-core/model/transaction';

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
  return {
    raw: response,
    error,
    isLoading,
    refresh: () => mutate(),
  };
}
