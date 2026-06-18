import { useWalletStore } from './useWalletStore';

describe('useWalletStore', () => {
  beforeEach(() => {
    useWalletStore.setState({
      currentWallet: null,
      targetWallet: null,
    });
  });

  it('starts with null wallet values', () => {
    const state = useWalletStore.getState();

    expect(state.currentWallet).toBeNull();
    expect(state.targetWallet).toBeNull();
  });

  it('sets current wallet', () => {
    useWalletStore.getState().setCurrentWallet('primary-wallet');

    expect(useWalletStore.getState().currentWallet).toBe('primary-wallet');
  });

  it('sets target wallet', () => {
    useWalletStore.getState().setTargetWallet('target-wallet');

    expect(useWalletStore.getState().targetWallet).toBe('target-wallet');
  });

  it('allows clearing wallet values back to null', () => {
    const store = useWalletStore.getState();

    store.setCurrentWallet('wallet-a');
    store.setTargetWallet('wallet-b');

    store.setCurrentWallet(null);
    store.setTargetWallet(null);

    const state = useWalletStore.getState();
    expect(state.currentWallet).toBeNull();
    expect(state.targetWallet).toBeNull();
  });
});
