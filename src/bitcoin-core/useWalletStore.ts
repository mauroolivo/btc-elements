import { create } from 'zustand';

import {
  Getwalletinfo,
  Listtransactions,
  Listwalletdir,
  Listwallets,
} from '@/bitcoin-core/model/wallet';
import {
  // getbalance,
  listwalletdir,
  listwallets,
  loadwallet,
  unloadwallet,
  getwalletinfo,
  listtransactions,
} from '@/bitcoin-core/api/api';

export type WalletState = {
  currentWallet: string | null;
  listwalletdir: Listwalletdir;
  listwallets: Listwallets;
  loading: boolean;
  walletInfo: Getwalletinfo | null;
  transactionList: Listtransactions | null;
  listwalletdirFetch: () => Promise<Listwalletdir>;
  listwalletsFetch: () => Promise<Listwallets>;
  loadWallet: (wallet: string) => Promise<void>;
  unloadWallet: (wallet: string) => Promise<void>;
  connectWallet: (wallet: string) => Promise<void>;
  getBalance: () => Promise<void>;
  getWalletinfo: () => Promise<void>;
  listTransactions: () => Promise<void>;
};

export const useWalletStore = create<WalletState>((set, get) => ({
  currentWallet: null,
  listwalletdir: {
    result: { wallets: [] },
    error: null,
    id: '',
  },
  listwallets: {
    result: [],
    error: null,
    id: '',
  },
  loading: false,
  walletInfo: null,
  transactionList: null,
  listwalletdirFetch: async () => {
    set({ loading: true });
    const data = await listwalletdir();
    set({ listwalletdir: data, loading: false });
    return data;
  },
  listwalletsFetch: async () => {
    set({ loading: true });
    const data = await listwallets();
    set({ listwallets: data, loading: false });
    return data;
  },
  loadWallet: async (wallet: string) => {
    set({ loading: true });
    await loadwallet(wallet);
    await get().listwalletsFetch();
    set({ loading: false });
  },
  unloadWallet: async (wallet: string) => {
    set({ loading: true });
    await unloadwallet(wallet);
    await get().listwalletsFetch();
    set({ loading: false });
  },
  connectWallet: async (wallet: string) => {
    set({ currentWallet: wallet, loading: false });
    get().getWalletinfo();
    get().listTransactions();
  },
  getBalance: async () => {
    set({ loading: true });
    const { currentWallet } = get();
    if (currentWallet === null) {
      set({ loading: false });
      return;
    } else {
      // const data = await getbalance(currentWallet);
    }
    set({ loading: false });
  },
  getWalletinfo: async () => {
    set({ loading: true });
    const { currentWallet } = get();
    if (currentWallet === null) {
      set({ loading: false });
      return;
    } else {
      set({ walletInfo: await getwalletinfo(currentWallet) });
    }
    set({ loading: false });
  },
  listTransactions: async () => {
    set({ loading: true });
    const { currentWallet } = get();
    if (currentWallet === null) {
      set({ loading: false });
      return;
    } else {
      const data = await listtransactions(currentWallet);
      set({ transactionList: data });
    }
    set({ loading: false });
  },
}));
