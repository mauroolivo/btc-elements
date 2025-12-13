import { create } from "zustand";

import { Listwalletdir, Listwallets } from "./model/wallet";
import {
  getbalance,
  listwalletdir,
  listwallets,
  loadwallet,
  unloadwallet,
} from "./calls";

export type WalletState = {
  currentWallet: string | null;
  listwalletdir: Listwalletdir;
  listwallets: Listwallets;
  loading: boolean;
  listwalletdirFetch: () => Promise<Listwalletdir>;
  listwalletsFetch: () => Promise<Listwallets>;
  loadWallet: (wallet: string) => Promise<void>;
  unloadWallet: (wallet: string) => Promise<void>;
  connectWallet: (wallet: string) => Promise<void>;
  getBalance: () => Promise<void>;
};

export const useWalletStore = create<WalletState>((set, get) => ({
  currentWallet: null,
  listwalletdir: {
    result: { wallets: [] },
    error: null,
    id: "",
  },
  listwallets: {
    result: [],
    error: null,
    id: "",
  },
  loading: false,
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
    set({ loading: false });
  },
  unloadWallet: async (wallet: string) => {
    set({ loading: true });
    await unloadwallet(wallet);
    set({ loading: false });
  },
  connectWallet: async (wallet: string) => {
    set({ currentWallet: wallet, loading: false });
    await get().getBalance();
  },
  getBalance: async () => {
    set({ loading: true });
    const { currentWallet } = get();
    if (currentWallet === null) {
      set({ loading: false });
      return;
    } else {
      const data = await getbalance(currentWallet);
      console.log("Balance:", data.result);
    }
    set({ loading: false });
  },
}));
