import { render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import ExplorerPage from './page';

const mockPush = jest.fn();
const mockLoadExplorerData = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@features/explorer/loadExplorerData', () => ({
  loadExplorerData: (...args: unknown[]) => mockLoadExplorerData(...args),
}));

describe('ExplorerPage integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the explorer search form and navigates on submit', async () => {
    const user = userEvent.setup();

    mockLoadExplorerData.mockResolvedValue({
      kind: 'empty',
      query: '',
      page: 1,
    });

    const tree = await ExplorerPage({ searchParams: Promise.resolve({}) });

    render(tree);

    expect(
      screen.getByRole('heading', { name: /transaction and blocks explorer/i })
    ).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText(/enter txid, blockhash, or block height/i),
      '   '
    );
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/explorer');
    });
  });
});
