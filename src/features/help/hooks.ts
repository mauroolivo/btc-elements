import useSWR from 'swr';
import { gethelp } from '@shared/lib/bitcoin-rpc/api';
import { Help } from '@shared/types/help';

export function useHelp(command?: string | null) {
  const cmd = (command ?? '').trim();
  const shouldFetch = true; // help works without args; allow empty to fetch general help
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['help', cmd] : null,
    () => gethelp(cmd.length > 0 ? cmd : undefined),
    { revalidateOnFocus: false }
  );
  return {
    help: (data as Help) ?? null,
    error,
    isLoading,
    refresh: () => mutate(),
  };
}
