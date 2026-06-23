import React from 'react';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import HomePage from './page';

const mockOpenDemoWallet = jest.fn();

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

jest.mock('@features/auth/useDemoWalletAccess', () => ({
  useDemoWalletAccess: () => ({
    demoError: null,
    isDemoOpening: false,
    openDemoWallet: mockOpenDemoWallet,
  }),
}));

describe('HomePage integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the landing hero and demo wallet action', async () => {
    const user = userEvent.setup();

    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: /welcome to the bitcoin core ui/i })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: /my wallets/i })[0]
    ).toHaveAttribute('href', '/my-wallets');

    await user.click(
      screen.getByRole('button', { name: /one click demo wallet/i })
    );

    expect(mockOpenDemoWallet).toHaveBeenCalledTimes(1);
  });
});
