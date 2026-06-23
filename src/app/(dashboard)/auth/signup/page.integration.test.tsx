import React from 'react';
import { render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import SignUpPage from './page';

const mockReplace = jest.fn();
const mockUseAuth = jest.fn();
const mockUseDemoWalletAccess = jest.fn();
const mockRegister = jest.fn();
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

describe('SignUpPage integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: jest.fn(),
      loginWithGithub: mockLoginWithGithub.mockResolvedValue({}),
      loginWithGoogle: mockLoginWithGoogle.mockResolvedValue({}),
      register: mockRegister.mockResolvedValue({}),
      logout: jest.fn(),
    });

    mockUseDemoWalletAccess.mockReturnValue({
      demoError: null,
      isDemoOpening: false,
      openDemoWallet: jest.fn(),
    });
  });

  it('renders the sign-up form and routes on successful registration', async () => {
    const user = userEvent.setup();

    render(<SignUpPage />);

    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'new@example.com',
        'password123'
      );
      expect(mockReplace).toHaveBeenCalledWith('/my-wallets');
    });
  });
});
