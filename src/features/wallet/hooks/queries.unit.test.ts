import { act, renderHook } from '@/test-utils';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { useWalletStore } from '@features/wallet/store';
import {
  useAddressInfo,
  useBalance,
  useChangeAddress,
  useTransactions,
  useWalletInfo,
  useWalletsDir,
} from './queries';

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('swr/infinite', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@features/wallet/store', () => ({
  useWalletStore: jest.fn(),
}));

jest.mock('@shared/lib/bitcoin-rpc/api', () => ({
  getaddressinfo: jest.fn(),
  getbalance: jest.fn(),
  getdescriptorinfo: jest.fn(),
  getrawchangeaddress: jest.fn(),
  getwalletinfo: jest.fn(),
  listaddressgroupings: jest.fn(),
  listtransactions: jest.fn(),
  listUnspent: jest.fn(),
  listwalletdir: jest.fn(),
  listwallets: jest.fn(),
}));

const mockedUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
const mockedUseSWRInfinite = useSWRInfinite as jest.MockedFunction<
  typeof useSWRInfinite
>;
const mockedUseWalletStore = useWalletStore as jest.MockedFunction<
  typeof useWalletStore
>;

describe('wallet queries hooks orchestration', () => {
  let currentWallet: string | null;

  beforeEach(() => {
    jest.clearAllMocks();
    currentWallet = null;

    mockedUseWalletStore.mockImplementation((selector) =>
      selector({
        currentWallet,
        targetWallet: null,
        setCurrentWallet: jest.fn(),
        setTargetWallet: jest.fn(),
      })
    );
  });

  it('useWalletsDir returns fallback result when data is missing and refresh calls mutate', () => {
    const mutate = jest.fn();
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      mutate,
      isValidating: false,
    } as never);

    const { result } = renderHook(() => useWalletsDir());

    expect(result.current.listwalletdir).toEqual({
      result: { wallets: [] },
      error: null,
      id: '',
    });

    act(() => {
      result.current.refresh();
    });

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('useWalletInfo disables SWR fetch when no wallet is selected', () => {
    const mutate = jest.fn();
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      mutate,
      isValidating: false,
    } as never);

    const { result } = renderHook(() => useWalletInfo());

    expect(mockedUseSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.objectContaining({ revalidateOnFocus: false })
    );
    expect(result.current.walletInfo).toBeNull();
  });

  it('useBalance uses wallet key and refresh triggers mutate', () => {
    currentWallet = 'wallet-1';
    const mutate = jest.fn();

    mockedUseSWR.mockReturnValue({
      data: { result: 1.25, error: null, id: 'curl' },
      error: null,
      isLoading: false,
      mutate,
      isValidating: false,
    } as never);

    const { result } = renderHook(() => useBalance());

    expect(mockedUseSWR).toHaveBeenCalledWith(
      ['getbalance', 'wallet-1'],
      expect.any(Function),
      expect.objectContaining({ revalidateOnFocus: false })
    );
    expect(result.current.balanceInfo?.result).toBe(1.25);

    act(() => {
      result.current.refresh();
    });

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('useTransactions flattens pages and controls pagination helpers', () => {
    currentWallet = 'wallet-2';
    const setSize = jest.fn();
    const mutate = jest.fn();

    mockedUseSWRInfinite.mockReturnValue({
      data: [
        { result: [{ txid: 'tx-1' }, { txid: 'tx-2' }] },
        { result: [{ txid: 'tx-3' }] },
      ],
      error: null,
      isLoading: false,
      isValidating: false,
      size: 2,
      setSize,
      mutate,
    } as never);

    const { result } = renderHook(() => useTransactions({ pageSize: 2 }));

    const getKey = mockedUseSWRInfinite.mock.calls[0]?.[0] as (
      pageIndex: number,
      previousPageData: { result: unknown[] } | null
    ) => unknown;

    expect(getKey(0, null)).toEqual([
      'listtransactions',
      'wallet-2',
      '*',
      2,
      0,
      true,
    ]);
    expect(getKey(1, { result: [{}, {}] })).toEqual([
      'listtransactions',
      'wallet-2',
      '*',
      2,
      2,
      true,
    ]);
    expect(getKey(2, { result: [{}] })).toBeNull();

    expect(result.current.transactions).toHaveLength(3);
    expect(result.current.hasMore).toBe(false);

    act(() => {
      result.current.loadMore();
      result.current.reset();
      result.current.refresh();
    });

    expect(setSize).toHaveBeenNthCalledWith(1, 3);
    expect(setSize).toHaveBeenNthCalledWith(2, 0);
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('useAddressInfo disables SWR fetch when address is empty', () => {
    currentWallet = 'wallet-3';
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    } as never);

    renderHook(() => useAddressInfo(''));

    expect(mockedUseSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.objectContaining({ revalidateOnFocus: false })
    );
  });

  it('useChangeAddress returns empty string fallback when data is missing', () => {
    currentWallet = 'wallet-4';
    mockedUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false,
    } as never);

    const { result } = renderHook(() => useChangeAddress());

    expect(result.current.changeAddress).toBe('');
  });
});
