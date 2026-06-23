import React from 'react';
import { render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import SignInPage from './page';

const mockReplace = jest.fn();
const mockUseAuth = jest.fn();
const mockUseDemoWalletAccess = jest.fn();
const mockLogin = jest.fn();
const mockLoginWithGithub = jest.fn();
const mockLoginWithGoogle = jest.fn();

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

describe('SignInPage integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin.mockResolvedValue({}),
      loginWithGithub: mockLoginWithGithub.mockResolvedValue({}),
      loginWithGoogle: mockLoginWithGoogle.mockResolvedValue({}),
      register: jest.fn(),
      logout: jest.fn(),
    });

    mockUseDemoWalletAccess.mockReturnValue({
      demoError: null,
      isDemoOpening: false,
      openDemoWallet: jest.fn(),
    });
  });

  it('renders the sign-in form and routes on successful login', async () => {
    const user = userEvent.setup();

    render(<SignInPage />);

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'secret123');
      expect(mockReplace).toHaveBeenCalledWith('/my-wallets');
    });
  });
});
