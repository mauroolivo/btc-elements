import {
  getblock,
  getblockhash,
  getrawtransaction,
} from '@shared/lib/bitcoin-rpc/api';

import { type Getblock } from './types';

const TRANSACTIONS_PER_PAGE = 10;

type BlockResult = Getblock['result'];
type TransactionResult = Awaited<
  ReturnType<typeof getrawtransaction>
>['result'];

export type ExplorerTransactionSummary = {
  txid: string;
  confirmations: number;
  size: number;
  vsize: number;
  outputCount: number;
  totalOut: number;
  error: boolean;
};

export type ExplorerLookupResult =
  | {
      kind: 'empty';
      query: string;
      page: number;
    }
  | {
      kind: 'not-found';
      query: string;
      page: number;
    }
  | {
      kind: 'block';
      query: string;
      page: number;
      block: BlockResult;
      transactionSummaries: ExplorerTransactionSummary[];
      totalTransactions: number;
      totalPages: number;
    }
  | {
      kind: 'transaction';
      query: string;
      page: number;
      transaction: TransactionResult;
    };

function hasRpcError(payload: { error?: { message?: string } | null } | null) {
  return Boolean(payload?.error);
}

function parsePage(page?: string | string[]) {
  const rawPage = Array.isArray(page) ? page[0] : page;
  const parsed = Number(rawPage);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

async function loadBlockByHeight(height: number): Promise<BlockResult | null> {
  const blockHashResponse = await getblockhash(height);

  if (hasRpcError(blockHashResponse)) {
    return null;
  }

  const blockResponse = await getblock(blockHashResponse.result, 1);

  if (hasRpcError(blockResponse)) {
    return null;
  }

  return blockResponse.result;
}

async function loadPagedTransactionSummaries(
  txids: string[],
  page: number
): Promise<{
  page: number;
  totalPages: number;
  transactionSummaries: ExplorerTransactionSummary[];
}> {
  const totalPages = Math.max(
    1,
    Math.ceil(txids.length / TRANSACTIONS_PER_PAGE)
  );
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
  const pageTxids = txids.slice(start, start + TRANSACTIONS_PER_PAGE);

  const transactionSummaries = await Promise.all(
    pageTxids.map(async (txid) => {
      const response = await getrawtransaction(txid, true);

      if (hasRpcError(response)) {
        return {
          txid,
          confirmations: 0,
          size: 0,
          vsize: 0,
          outputCount: 0,
          totalOut: 0,
          error: true,
        } satisfies ExplorerTransactionSummary;
      }

      const result = response.result;

      return {
        txid: result.txid,
        confirmations: result.confirmations ?? 0,
        size: result.size,
        vsize: result.vsize,
        outputCount: result.vout.length,
        totalOut: result.vout.reduce(
          (sum, value) => sum + (value.value || 0),
          0
        ),
        error: false,
      } satisfies ExplorerTransactionSummary;
    })
  );

  return {
    page: currentPage,
    totalPages,
    transactionSummaries,
  };
}

export async function loadExplorerData(params?: {
  ref?: string | string[];
  page?: string | string[];
}): Promise<ExplorerLookupResult> {
  const query =
    (Array.isArray(params?.ref) ? params?.ref[0] : params?.ref)?.trim() ?? '';
  const requestedPage = parsePage(params?.page);

  if (!query) {
    return {
      kind: 'empty',
      query: '',
      page: 1,
    };
  }

  if (/^\d+$/.test(query)) {
    const block = await loadBlockByHeight(Number(query));

    if (!block) {
      return {
        kind: 'not-found',
        query,
        page: requestedPage,
      };
    }

    const { page, totalPages, transactionSummaries } =
      await loadPagedTransactionSummaries(block.tx, requestedPage);

    return {
      kind: 'block',
      query,
      page,
      block,
      transactionSummaries,
      totalTransactions: block.tx.length,
      totalPages,
    };
  }

  const [transactionResponse, blockResponse] = await Promise.all([
    getrawtransaction(query, true),
    getblock(query, 1),
  ]);

  if (!hasRpcError(blockResponse)) {
    const { page, totalPages, transactionSummaries } =
      await loadPagedTransactionSummaries(
        blockResponse.result.tx,
        requestedPage
      );

    return {
      kind: 'block',
      query,
      page,
      block: blockResponse.result,
      transactionSummaries,
      totalTransactions: blockResponse.result.tx.length,
      totalPages,
    };
  }

  if (!hasRpcError(transactionResponse)) {
    return {
      kind: 'transaction',
      query,
      page: requestedPage,
      transaction: transactionResponse.result,
    };
  }

  return {
    kind: 'not-found',
    query,
    page: requestedPage,
  };
}
