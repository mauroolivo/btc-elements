'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

type BlockTransactionsPagerProps = {
  query: string;
  page: number;
  totalPages: number;
};

export function BlockTransactionsPager({
  query,
  page,
  totalPages,
}: BlockTransactionsPagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const previousHref = buildExplorerHref(query, page - 1);
  const nextHref = buildExplorerHref(query, page + 1);

  function navigateToPage(href: string) {
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-300">
      {page > 1 ? (
        <button
          type="button"
          onClick={() => navigateToPage(previousHref)}
          disabled={isPending}
          className="core-button-secondary px-2 py-1"
        >
          Prev
        </button>
      ) : (
        <span className="core-button-secondary cursor-not-allowed px-2 py-1 opacity-50">
          Prev
        </span>
      )}
      <div>
        {isPending ? 'Loading page...' : `Page ${page} of ${totalPages}`}
      </div>
      {page < totalPages ? (
        <button
          type="button"
          onClick={() => navigateToPage(nextHref)}
          disabled={isPending}
          className="core-button-secondary px-2 py-1"
        >
          Next
        </button>
      ) : (
        <span className="core-button-secondary cursor-not-allowed px-2 py-1 opacity-50">
          Next
        </span>
      )}
    </div>
  );
}

function buildExplorerHref(query: string, page: number) {
  const params = new URLSearchParams({ ref: query, page: String(page) });
  return `/explorer?${params.toString()}`;
}
