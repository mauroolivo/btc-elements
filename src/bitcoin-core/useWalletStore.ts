import { create } from 'zustand';

export type WalletState = {
  currentWallet: string | null;
  setCurrentWallet: (wallet: string) => void;
};

export const useWalletStore = create<WalletState>((set) => ({
  currentWallet: null,
  setCurrentWallet: (wallet: string) => {
    set({ currentWallet: wallet });
  },
}));
