import useSWR from 'swr';
import { gethelp } from '@/bitcoin-core/api/api';
import { Help } from '@/bitcoin-core/model/help';

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
