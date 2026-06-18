import { loadExplorerData } from './loadExplorerData';
import {
  getblock,
  getblockhash,
  getrawtransaction,
} from '@shared/lib/bitcoin-rpc/api';

jest.mock('@shared/lib/bitcoin-rpc/api', () => ({
  getblock: jest.fn(),
  getblockhash: jest.fn(),
  getrawtransaction: jest.fn(),
}));

const mockedGetblock = getblock as jest.MockedFunction<typeof getblock>;
const mockedGetblockhash = getblockhash as jest.MockedFunction<
  typeof getblockhash
>;
const mockedGetrawtransaction = getrawtransaction as jest.MockedFunction<
  typeof getrawtransaction
>;

function makeBlockResponse(txids: string[]) {
  return {
    result: {
      hash: 'block-hash',
      confirmations: 10,
      height: 200,
      version: 1,
      versionHex: '00000001',
      merkleroot: 'merkle-root',
      time: 1710000000,
      mediantime: 1710000000,
      nonce: 1,
      bits: '1d00ffff',
      difficulty: 1,
      chainwork: '00',
      nTx: txids.length,
      previousblockhash: 'prev-hash',
      nextblockhash: 'next-hash',
      strippedsize: 1000,
      size: 1200,
      weight: 4000,
      tx: txids,
    },
    id: 'curl',
  };
}

function makeTransactionResponse(txid: string, totalOut = 0.35) {
  return {
    result: {
      txid,
      hash: `hash-${txid}`,
      version: 2,
      size: 120,
      vsize: 110,
      weight: 440,
      locktime: 0,
      vin: [
        {
          txid: 'input-txid',
          vout: 0,
          scriptSig: {
            asm: 'asm',
            hex: '00',
          },
          txinwitness: ['00'],
          sequence: 4294967295,
        },
      ],
      vout: [
        {
          value: totalOut,
          n: 0,
          scriptPubKey: {
            asm: 'asm',
            desc: 'desc',
            hex: '00',
            address: 'tb1qexample',
            type: 'witness_v0_keyhash',
          },
        },
      ],
      hex: '00',
      blockhash: 'block-hash',
      confirmations: 3,
      time: 1710000010,
      blocktime: 1710000010,
    },
    id: 'curl',
  };
}

const rpcErrorBase = {
  error: {
    code: -5,
    message: 'not found',
  },
  id: 'curl',
};

const rpcErrorForGetblockhash = rpcErrorBase as Awaited<
  ReturnType<typeof getblockhash>
>;
const rpcErrorForGetblock = rpcErrorBase as Awaited<
  ReturnType<typeof getblock>
>;
const rpcErrorForGetrawtransaction = rpcErrorBase as Awaited<
  ReturnType<typeof getrawtransaction>
>;

describe('loadExplorerData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty result for blank query', async () => {
    const result = await loadExplorerData({ ref: '   ' });

    expect(result).toEqual({
      kind: 'empty',
      query: '',
      page: 1,
    });
    expect(mockedGetblockhash).not.toHaveBeenCalled();
    expect(mockedGetblock).not.toHaveBeenCalled();
    expect(mockedGetrawtransaction).not.toHaveBeenCalled();
  });

  it('returns not-found for numeric query when blockhash lookup fails', async () => {
    mockedGetblockhash.mockResolvedValueOnce(rpcErrorForGetblockhash);

    const result = await loadExplorerData({ ref: '1234', page: '2' });

    expect(result).toEqual({
      kind: 'not-found',
      query: '1234',
      page: 2,
    });
  });

  it('returns block result for numeric query and resolves paged summaries', async () => {
    const txids = Array.from({ length: 12 }, (_, index) => `tx-${index}`);

    mockedGetblockhash.mockResolvedValueOnce({
      result: 'hash-for-height',
      id: 'curl',
    });
    mockedGetblock.mockResolvedValueOnce(makeBlockResponse(txids));
    mockedGetrawtransaction.mockImplementation(async (txid: string) => {
      return makeTransactionResponse(txid, 0.5);
    });

    const result = await loadExplorerData({ ref: '100' });

    expect(result.kind).toBe('block');
    if (result.kind !== 'block') {
      throw new Error('Expected block result');
    }

    expect(result.totalTransactions).toBe(12);

    const page = await result.transactionSummariesPromise;
    expect(page.page).toBe(1);
    expect(page.totalPages).toBe(2);
    expect(page.transactionSummaries).toHaveLength(10);
    expect(page.transactionSummaries[0]).toMatchObject({
      txid: 'tx-0',
      outputCount: 1,
      totalOut: 0.5,
      error: false,
    });
  });

  it('clamps requested page to total pages', async () => {
    const txids = Array.from({ length: 11 }, (_, index) => `tx-${index}`);

    mockedGetblockhash.mockResolvedValueOnce({
      result: 'hash-for-height',
      id: 'curl',
    });
    mockedGetblock.mockResolvedValueOnce(makeBlockResponse(txids));
    mockedGetrawtransaction.mockImplementation(async (txid: string) => {
      return makeTransactionResponse(txid, 0.25);
    });

    const result = await loadExplorerData({ ref: '55', page: '999' });
    expect(result.kind).toBe('block');

    if (result.kind !== 'block') {
      throw new Error('Expected block result');
    }

    const page = await result.transactionSummariesPromise;
    expect(page.page).toBe(2);
    expect(page.totalPages).toBe(2);
    expect(page.transactionSummaries).toHaveLength(1);
    expect(page.transactionSummaries[0]?.txid).toBe('tx-10');
  });

  it('returns page 1 when page param is invalid', async () => {
    mockedGetblockhash.mockResolvedValueOnce(rpcErrorForGetblockhash);

    const result = await loadExplorerData({ ref: '99', page: 'invalid' });

    expect(result).toEqual({
      kind: 'not-found',
      query: '99',
      page: 1,
    });
  });

  it('prefers block result over transaction result when both resolve', async () => {
    mockedGetrawtransaction.mockResolvedValueOnce(
      makeTransactionResponse('tx-abc')
    );
    mockedGetblock.mockResolvedValueOnce(makeBlockResponse(['tx-abc']));

    const result = await loadExplorerData({ ref: 'abc-hash' });

    expect(result.kind).toBe('block');
    expect(mockedGetblock).toHaveBeenCalledWith('abc-hash', 1);
    expect(mockedGetrawtransaction).toHaveBeenCalledWith('abc-hash', true);
  });

  it('returns transaction result when block lookup fails and tx lookup succeeds', async () => {
    mockedGetrawtransaction.mockResolvedValueOnce(
      makeTransactionResponse('tx-123')
    );
    mockedGetblock.mockResolvedValueOnce(rpcErrorForGetblock);

    const result = await loadExplorerData({ ref: 'tx-123' });

    expect(result.kind).toBe('transaction');
    if (result.kind !== 'transaction') {
      throw new Error('Expected transaction result');
    }
    expect(result.transaction.txid).toBe('tx-123');
  });

  it('returns not-found when block and transaction lookups fail', async () => {
    mockedGetrawtransaction.mockResolvedValueOnce(rpcErrorForGetrawtransaction);
    mockedGetblock.mockResolvedValueOnce(rpcErrorForGetblock);

    const result = await loadExplorerData({ ref: 'missing-ref' });

    expect(result).toEqual({
      kind: 'not-found',
      query: 'missing-ref',
      page: 1,
    });
  });

  it('marks transaction summary as error when raw transaction lookup fails', async () => {
    mockedGetblockhash.mockResolvedValueOnce({
      result: 'hash-for-height',
      id: 'curl',
    });
    mockedGetblock.mockResolvedValueOnce(
      makeBlockResponse(['tx-good', 'tx-bad'])
    );
    mockedGetrawtransaction
      .mockResolvedValueOnce(makeTransactionResponse('tx-good', 0.2))
      .mockResolvedValueOnce(rpcErrorForGetrawtransaction);

    const result = await loadExplorerData({ ref: '123' });

    expect(result.kind).toBe('block');
    if (result.kind !== 'block') {
      throw new Error('Expected block result');
    }

    const page = await result.transactionSummariesPromise;
    expect(page.transactionSummaries[0]).toMatchObject({
      txid: 'tx-good',
      error: false,
      totalOut: 0.2,
    });
    expect(page.transactionSummaries[1]).toMatchObject({
      txid: 'tx-bad',
      error: true,
      confirmations: 0,
      totalOut: 0,
    });
  });
});
