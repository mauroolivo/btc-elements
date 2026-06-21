import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test-utils';
import SignInPage from './page';

const mockReplace = jest.fn();
const mockUseAuth = jest.fn();
const mockUseDemoWalletAccess = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@features/auth', () => ({
  useAuth: () => mockUseAuth(),
  useDemoWalletAccess: () => mockUseDemoWalletAccess(),
}));

type AuthMockState = {
  user: { email?: string } | null;
  loading: boolean;
  login: jest.Mock<Promise<unknown>, [string, string]>;
  loginWithGoogle: jest.Mock<Promise<unknown>, []>;
  loginWithGithub: jest.Mock<Promise<unknown>, []>;
};

type DemoMockState = {
  demoError: string | null;
  isDemoOpening: boolean;
  openDemoWallet: jest.Mock<void, []>;
};

function setup(
  authOverrides: Partial<AuthMockState> = {},
  demoOverrides: Partial<DemoMockState> = {}
) {
  const authState: AuthMockState = {
    user: null,
    loading: false,
    login: jest.fn().mockResolvedValue({}),
    loginWithGoogle: jest.fn().mockResolvedValue({}),
    loginWithGithub: jest.fn().mockResolvedValue({}),
    ...authOverrides,
  };

  const demoState: DemoMockState = {
    demoError: null,
    isDemoOpening: false,
    openDemoWallet: jest.fn(),
    ...demoOverrides,
  };

  mockUseAuth.mockReturnValue(authState);
  mockUseDemoWalletAccess.mockReturnValue(demoState);

  render(<SignInPage />);

  return { authState, demoState };
}

describe('SignInPage (functional)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state while auth session is being checked', () => {
    setup({ loading: true });

    expect(
      screen.getByText('Checking your current session...')
    ).toBeInTheDocument();
  });

  it('validates required login form fields', async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('Enter a valid email address')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Password must be at least 6 characters long')
    ).toBeInTheDocument();
  });

  it('submits email/password and routes to my-wallets on success', async () => {
    const user = userEvent.setup();
    const { authState } = setup();

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(authState.login).toHaveBeenCalledWith(
        'user@example.com',
        'secret123'
      );
      expect(mockReplace).toHaveBeenCalledWith('/my-wallets');
    });
  });

  it('maps invalid credential errors to a friendly message', async () => {
    const user = userEvent.setup();
    const { authState } = setup({
      login: jest.fn().mockRejectedValue(new Error('auth/invalid-credential')),
    });

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(authState.login).toHaveBeenCalled();
      expect(
        screen.getByText('Invalid email or password.')
      ).toBeInTheDocument();
    });
  });

  it('handles Google sign-in action', async () => {
    const user = userEvent.setup();
    const { authState } = setup();

    await user.click(
      screen.getByRole('button', { name: 'Continue with Google' })
    );

    await waitFor(() => {
      expect(authState.loginWithGoogle).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/my-wallets');
    });
  });

  it('handles GitHub sign-in action', async () => {
    const user = userEvent.setup();
    const { authState } = setup();

    await user.click(
      screen.getByRole('button', { name: 'Continue with GitHub' })
    );

    await waitFor(() => {
      expect(authState.loginWithGithub).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/my-wallets');
    });
  });

  it('renders demo error state and triggers demo wallet opening', async () => {
    const user = userEvent.setup();
    const { demoState } = setup(
      {},
      {
        demoError: 'Demo wallet is not available right now.',
      }
    );

    expect(
      screen.getByText('Demo wallet is not available right now.')
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: '👉 One Click Demo Wallet' })
    );

    expect(demoState.openDemoWallet).toHaveBeenCalledTimes(1);
  });
});
