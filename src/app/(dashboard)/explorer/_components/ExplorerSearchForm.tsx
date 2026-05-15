'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { ExplorerLoadingView } from './ExplorerLoadingView';

type ExplorerSearchFormProps = {
  initialQuery: string;
};

export function ExplorerSearchForm({ initialQuery }: ExplorerSearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    startTransition(() => {
      if (!trimmedQuery) {
        router.push('/explorer');
        return;
      }

      const params = new URLSearchParams({ ref: trimmedQuery });
      router.push(`/explorer?${params.toString()}`);
    });
  }

  function handleClear() {
    setQuery('');

    startTransition(() => {
      router.push('/explorer');
    });
  }

  return (
    <>
      <form
        noValidate
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            name="ref"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter TxID, Blockhash, or Block Height"
            className="core-input w-full rounded-2xl p-4 font-mono text-lg text-white placeholder-gray-500 focus:outline-none"
          />
          <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:flex-none">
            <button
              type="submit"
              disabled={isPending}
              className="core-button-primary w-full px-4 py-3 disabled:cursor-wait disabled:opacity-70"
            >
              {isPending ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isPending && query.trim() === ''}
              className="core-button-secondary w-full px-4 py-3 disabled:cursor-wait disabled:opacity-70"
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      {isPending ? (
        <div className="mx-auto mt-6 w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
          <ExplorerLoadingView
            title="Fetching explorer data"
            description="Checking the transaction and block references against your node..."
          />
        </div>
      ) : null}
    </>
  );
}
