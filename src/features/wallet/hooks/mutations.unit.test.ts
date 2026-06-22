import { act, renderHook } from '@/test-utils';
import useSWRMutation from 'swr/mutation';
import { mutate as swrMutate } from 'swr';
import { useWalletStore } from '@features/wallet/store';
import {
  useBumpfee,
  useCreateWallet,
  useNewAddress,
  useSendAdvanced,
  useSendtoaddress,
} from './mutations';
import {
  bumpfee,
  createrawtransaction,
  createwallet,
  getnewaddress,
  sendrawtransaction,
  sendtoaddress,
  signrawtransactionwithwallet,
} from '@shared/lib/bitcoin-rpc/api';

jest.mock('swr', () => ({
  mutate: jest.fn(),
}));

jest.mock('swr/mutation', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@features/wallet/store', () => ({
  useWalletStore: jest.fn(),
}));

jest.mock('@shared/lib/bitcoin-rpc/api', () => ({
  bumpfee: jest.fn(),
  createrawtransaction: jest.fn(),
  createwallet: jest.fn(),
  getnewaddress: jest.fn(),
  loadwallet: jest.fn(),
  sendrawtransaction: jest.fn(),
  sendtoaddress: jest.fn(),
  signrawtransactionwithwallet: jest.fn(),
  unloadwallet: jest.fn(),
}));

const mockedUseSWRMutation = useSWRMutation as jest.MockedFunction<
  typeof useSWRMutation
>;
const mockedSWRMutate = swrMutate as jest.MockedFunction<typeof swrMutate>;
const mockedUseWalletStore = useWalletStore as jest.MockedFunction<
  typeof useWalletStore
>;

const mockedCreatewallet = createwallet as jest.MockedFunction<
  typeof createwallet
>;
const mockedGetnewaddress = getnewaddress as jest.MockedFunction<
  typeof getnewaddress
>;
const mockedSendtoaddress = sendtoaddress as jest.MockedFunction<
  typeof sendtoaddress
>;
const mockedCreaterawtransaction = createrawtransaction as jest.MockedFunction<
  typeof createrawtransaction
>;
const mockedSignrawtransactionwithwallet =
  signrawtransactionwithwallet as jest.MockedFunction<
    typeof signrawtransactionwithwallet
  >;
const mockedSendrawtransaction = sendrawtransaction as jest.MockedFunction<
  typeof sendrawtransaction
>;
const mockedBumpfee = bumpfee as jest.MockedFunction<typeof bumpfee>;

describe('wallet mutations hooks orchestration', () => {
  let currentWallet: string | null;
  let resetMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    currentWallet = null;
    resetMock = jest.fn();

    mockedUseWalletStore.mockImplementation((selector) =>
      selector({
        currentWallet,
        targetWallet: null,
        setCurrentWallet: jest.fn(),
        setTargetWallet: jest.fn(),
      })
    );

    mockedUseSWRMutation.mockImplementation(
      (key, fetcher) =>
        ({
          trigger: (arg: unknown) =>
            (fetcher as (nextKey: unknown, options: { arg: unknown }) => unknown)(
              key,
              { arg }
            ),
          data: undefined,
          error: undefined,
          isMutating: false,
          reset: resetMock,
        }) as never
    );
  });

  it('useCreateWallet triggers createwallet and refreshes wallet caches', async () => {
    mockedCreatewallet.mockResolvedValue({
      result: { name: 'wallet-a', warnings: [] },
      id: 'curl',
    } as never);

    const { result } = renderHook(() => useCreateWallet());

    await act(async () => {
      await result.current.create('wallet-a');
    });

    expect(mockedCreatewallet).toHaveBeenCalledWith('wallet-a');
    expect(mockedSWRMutate).toHaveBeenNthCalledWith(1, 'listwalletdir');
    expect(mockedSWRMutate).toHaveBeenNthCalledWith(2, 'listwallets');
  });

  it('useNewAddress throws when no wallet is selected', () => {
    const { result } = renderHook(() => useNewAddress());

    expect(() => result.current.generate('bech32')).toThrow(
      'No wallet selected'
    );
  });

  it('useNewAddress uses selected wallet when generating address', async () => {
    currentWallet = 'wallet-b';
    mockedGetnewaddress.mockResolvedValue({
      result: 'tb1qnew',
      id: 'curl',
    } as never);

    const { result } = renderHook(() => useNewAddress());

    await act(async () => {
      await result.current.generate('bech32');
    });

    expect(mockedGetnewaddress).toHaveBeenCalledWith('wallet-b', 'bech32');
  });

  it('useSendtoaddress sends payload for selected wallet and clear calls reset', async () => {
    currentWallet = 'wallet-c';
    const payload = { address: 'tb1qto', amount: 0.01 };
    mockedSendtoaddress.mockResolvedValue({
      result: 'txid-1',
      id: 'curl',
    } as never);

    const { result } = renderHook(() => useSendtoaddress());

    await act(async () => {
      await result.current.send(payload);
    });

    expect(mockedSendtoaddress).toHaveBeenCalledWith(payload, 'wallet-c');

    act(() => {
      result.current.clear();
    });
    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  it('useSendAdvanced runs create-sign-broadcast chain', async () => {
    currentWallet = 'wallet-d';
    mockedCreaterawtransaction.mockResolvedValue({
      result: 'rawhex',
      id: 'curl',
    } as never);
    mockedSignrawtransactionwithwallet.mockResolvedValue({
      result: { hex: 'signedhex', complete: true },
      id: 'curl',
    } as never);
    mockedSendrawtransaction.mockResolvedValue({
      result: 'txid-final',
      id: 'curl',
    } as never);

    const { result } = renderHook(() => useSendAdvanced());

    await act(async () => {
      const txid = await result.current.run({ inputs: [], outputs: {} });
      expect(txid).toBe('txid-final');
    });

    expect(mockedCreaterawtransaction).toHaveBeenCalledWith(
      { inputs: [], outputs: {} },
      'wallet-d'
    );
    expect(mockedSignrawtransactionwithwallet).toHaveBeenCalledWith(
      { hexstring: 'rawhex' },
      'wallet-d'
    );
    expect(mockedSendrawtransaction).toHaveBeenCalledWith(
      { hexstring: 'signedhex' },
      'wallet-d'
    );
  });

  it('useSendAdvanced throws when create raw transaction returns rpc error', async () => {
    currentWallet = 'wallet-e';
    mockedCreaterawtransaction.mockResolvedValue({
      error: { code: -1, message: 'insufficient funds' },
      id: 'curl',
    } as never);

    const { result } = renderHook(() => useSendAdvanced());

    await expect(
      act(async () => {
        await result.current.run({ inputs: [], outputs: {} });
      })
    ).rejects.toThrow('createrawtransaction failed: insufficient funds');
  });

  it('useBumpfee throws when no wallet is selected', () => {
    const { result } = renderHook(() => useBumpfee());

    expect(() => result.current.bump({ txid: 'abc' })).toThrow(
      'No wallet selected'
    );
  });

  it('useBumpfee sends payload when wallet is selected', async () => {
    currentWallet = 'wallet-f';
    mockedBumpfee.mockResolvedValue({
      result: { txid: 'new-txid' },
      id: 'curl',
    } as never);

    const { result } = renderHook(() => useBumpfee());

    await act(async () => {
      await result.current.bump({ txid: 'old-txid', options: { fee_rate: 5 } });
    });

    expect(mockedBumpfee).toHaveBeenCalledWith(
      { txid: 'old-txid', options: { fee_rate: 5 } },
      'wallet-f'
    );
  });
});
