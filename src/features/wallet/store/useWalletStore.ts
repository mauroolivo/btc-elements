import { create } from 'zustand';

export type WalletState = {
  currentWallet: string | null;
  targetWallet: string | null;
  setCurrentWallet: (wallet: string | null) => void;
  setTargetWallet: (wallet: string | null) => void;
};

export const useWalletStore = create<WalletState>((set) => ({
  currentWallet: null,
  targetWallet: null,
  setCurrentWallet: (wallet: string | null) => {
    set({ currentWallet: wallet });
  },
  setTargetWallet: (wallet: string | null) => {
    set({ targetWallet: wallet });
  },
}));
