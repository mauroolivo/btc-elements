import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test-utils';
import { ExplorerSearchForm } from './ExplorerSearchForm';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ExplorerSearchForm (functional)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the provided initial query', () => {
    render(<ExplorerSearchForm initialQuery="block-123" />);

    const input = screen.getByPlaceholderText(
      'Enter TxID, Blockhash, or Block Height'
    );
    expect(input).toHaveValue('block-123');
  });

  it('submits trimmed query and pushes explorer route with ref param', async () => {
    const user = userEvent.setup();
    render(<ExplorerSearchForm initialQuery="" />);

    const input = screen.getByPlaceholderText(
      'Enter TxID, Blockhash, or Block Height'
    );
    await user.type(input, '  txid-001  ');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/explorer?ref=txid-001');
    });
  });

  it('submits blank query to /explorer', async () => {
    const user = userEvent.setup();
    render(<ExplorerSearchForm initialQuery="   " />);

    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/explorer');
    });
  });

  it('clears query and pushes /explorer when Clear is clicked', async () => {
    const user = userEvent.setup();
    render(<ExplorerSearchForm initialQuery="some-query" />);

    const input = screen.getByPlaceholderText(
      'Enter TxID, Blockhash, or Block Height'
    );
    await user.click(screen.getByRole('button', { name: 'Clear' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/explorer');
    });

    expect(input).toHaveValue('');
  });
});
