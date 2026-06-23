import { render, screen, waitFor } from '@/test-utils';
import Wallet from './Wallet';
import { useAuth } from '@features/auth';
import { useWalletStore } from '@features/wallet/store';
import {
  useBalance,
  useLoadWallet,
  useWalletInfo,
  useWalletsList,
} from '@features/wallet/hooks';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@features/auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@features/wallet/store', () => ({
  useWalletStore: jest.fn(),
}));

jest.mock('@features/wallet/hooks', () => ({
  useBalance: jest.fn(),
  useLoadWallet: jest.fn(),
  useWalletInfo: jest.fn(),
  useWalletsList: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseWalletStore = useWalletStore as jest.MockedFunction<
  typeof useWalletStore
>;
const mockedUseBalance = useBalance as jest.MockedFunction<typeof useBalance>;
const mockedUseLoadWallet = useLoadWallet as jest.MockedFunction<
  typeof useLoadWallet
>;
const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<
  typeof useWalletInfo
>;
const mockedUseWalletsList = useWalletsList as jest.MockedFunction<
  typeof useWalletsList
>;

describe('Wallet integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: jest.fn(),
      loginWithGithub: jest.fn(),
      loginWithGoogle: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });

    mockedUseWalletStore.mockReturnValue({
      currentWallet: null,
      targetWallet: null,
      setCurrentWallet: jest.fn(),
      setTargetWallet: jest.fn(),
    } as never);

    mockedUseWalletsList.mockReturnValue({
      listwallets: { result: [], error: null, id: 'curl' },
      error: null,
      isLoading: false,
      refresh: jest.fn(),
    } as never);

    mockedUseLoadWallet.mockReturnValue({
      load: jest.fn(),
      isLoading: false,
      error: null,
    } as never);

    mockedUseWalletInfo.mockReturnValue({
      walletInfo: null,
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    } as never);

    mockedUseBalance.mockReturnValue({
      balanceInfo: null,
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    } as never);
  });

  it('redirects to my-wallets when no wallet is selected', async () => {
    render(<Wallet />);

    expect(screen.getByText(/redirecting to my wallets/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/my-wallets');
    });
  });
});
