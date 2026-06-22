import { act, renderHook, waitFor } from '@/test-utils';
import { useDemoWalletAccess } from './useDemoWalletAccess';
import { useAuth } from './useAuth';
import { useWalletStore } from '@features/wallet/store';
import { useCreateWallet, useWalletsDir } from '@features/wallet/hooks';
import { getUserWallets } from '@/lib/firebase/wallets';

const mockPush = jest.fn();
const mockSetTargetWallet = jest.fn();
const mockCreateWallet = jest.fn();
const mockRefreshWalletDir = jest.fn();
const mockLogin = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('./useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@features/wallet/store', () => ({
  useWalletStore: jest.fn(),
}));

jest.mock('@features/wallet/hooks', () => ({
  useCreateWallet: jest.fn(),
  useWalletsDir: jest.fn(),
}));

jest.mock('@/lib/firebase/wallets', () => ({
  getUserWallets: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseWalletStore = useWalletStore as jest.MockedFunction<
  typeof useWalletStore
>;
const mockedUseCreateWallet = useCreateWallet as jest.MockedFunction<
  typeof useCreateWallet
>;
const mockedUseWalletsDir = useWalletsDir as jest.MockedFunction<
  typeof useWalletsDir
>;
const mockedGetUserWallets = getUserWallets as jest.MockedFunction<
  typeof getUserWallets
>;

describe('useDemoWalletAccess orchestration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseWalletStore.mockReturnValue({
      currentWallet: null,
      targetWallet: null,
      setCurrentWallet: jest.fn(),
      setTargetWallet: mockSetTargetWallet,
    } as never);

    mockedUseCreateWallet.mockReturnValue({
      create: mockCreateWallet,
      error: undefined,
      isLoading: false,
      response: undefined,
    } as never);

    mockedUseWalletsDir.mockReturnValue({
      listwalletdir: {
        result: { wallets: [{ name: 'wallet-1' }] },
        error: undefined,
        id: 'curl',
      },
      error: undefined,
      isLoading: false,
      refresh: mockRefreshWalletDir,
    } as never);

    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin,
      loginWithGithub: jest.fn(),
      loginWithGoogle: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });
  });

  it('calls onBlockedAccount when authenticated user is not demo account', async () => {
    const onBlockedAccount = jest.fn();

    mockedUseAuth.mockReturnValue({
      user: { email: 'user@example.com', uid: 'user-1' } as never,
      loading: false,
      login: mockLogin,
      loginWithGithub: jest.fn(),
      loginWithGoogle: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });

    const { result } = renderHook(() =>
      useDemoWalletAccess({ onBlockedAccount })
    );

    await act(async () => {
      await result.current.openDemoWallet();
    });

    expect(onBlockedAccount).toHaveBeenCalledWith('user@example.com');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('logs in with demo credentials and navigates to wallet when user wallet exists', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ email: 'demo@example.com', password: 'secret' }),
    } as Response);

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      writable: true,
      value: fetchMock,
    });

    mockLogin.mockResolvedValue({ user: { uid: 'demo-user' } });
    mockedGetUserWallets.mockResolvedValue([{ id: 'wallet-1' }] as never);

    const { result } = renderHook(() => useDemoWalletAccess());

    await act(async () => {
      await result.current.openDemoWallet();
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/demo-credentials', {
      cache: 'no-store',
    });
    expect(mockLogin).toHaveBeenCalledWith('demo@example.com', 'secret');
    expect(mockSetTargetWallet).toHaveBeenCalledWith('wallet-1');
    expect(mockPush).toHaveBeenCalledWith('/wallet');
  });

  it('sets demoError when user has no wallet documents', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ email: 'demo@example.com', password: 'secret' }),
    } as Response);

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      writable: true,
      value: fetchMock,
    });

    mockLogin.mockResolvedValue({ user: { uid: 'demo-user' } });
    mockedGetUserWallets.mockResolvedValue([] as never);

    const { result } = renderHook(() => useDemoWalletAccess());

    await act(async () => {
      await result.current.openDemoWallet();
    });

    await waitFor(() => {
      expect(result.current.demoError).toBe(
        'Demo wallet is not available right now.'
      );
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('creates wallet in core when it is missing and then refreshes wallet dir', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ email: 'demo@example.com', password: 'secret' }),
    } as Response);

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      writable: true,
      value: fetchMock,
    });

    mockedUseWalletsDir.mockReturnValue({
      listwalletdir: {
        result: { wallets: [] },
        error: undefined,
        id: 'curl',
      },
      error: undefined,
      isLoading: false,
      refresh: mockRefreshWalletDir,
    } as never);

    mockLogin.mockResolvedValue({ user: { uid: 'demo-user' } });
    mockedGetUserWallets.mockResolvedValue([{ id: 'wallet-2' }] as never);
    mockCreateWallet.mockResolvedValue({
      result: { name: 'wallet-2' },
      id: 'curl',
    });

    const { result } = renderHook(() => useDemoWalletAccess());

    await act(async () => {
      await result.current.openDemoWallet();
    });

    expect(mockCreateWallet).toHaveBeenCalledWith('wallet-2');
    expect(mockRefreshWalletDir).toHaveBeenCalledTimes(1);
    expect(mockSetTargetWallet).toHaveBeenCalledWith('wallet-2');
    expect(mockPush).toHaveBeenCalledWith('/wallet');
  });
});
