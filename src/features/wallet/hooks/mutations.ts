import { mutate as swrMutate } from 'swr';
import useSWRMutation from 'swr/mutation';

import { useWalletStore } from '@features/wallet/store';
import {
  BroadcastResponse,
  Bumpfee,
  Createrawtransaction,
  Createwallet,
  Newaddress,
  Sendtoaddress,
  Signrawtransactionwithwallet,
} from '@features/wallet/types/wallet';
import {
  bumpfee,
  createrawtransaction,
  createwallet,
  getnewaddress,
  loadwallet,
  sendrawtransaction,
  sendtoaddress,
  signrawtransactionwithwallet,
  unloadwallet,
} from '@shared/lib/bitcoin-rpc/api';
import { ParamsDictionary } from '@shared/types/params';

export function useLoadWallet() {
  const { trigger, isMutating, error } = useSWRMutation(
    'loadwallet',
    async (_key, { arg }: { arg: string }) => {
      await loadwallet(arg);
      await swrMutate('listwallets');
    }
  );
  return {
    load: (wallet: string) => trigger(wallet),
    isLoading: isMutating,
    error,
  };
}

export function useUnloadWallet() {
  const { trigger, isMutating, error } = useSWRMutation(
    'unloadwallet',
    async (_key, { arg }: { arg: string }) => {
      await unloadwallet(arg);
      await swrMutate('listwallets');
    }
  );
  return {
    unload: (wallet: string) => trigger(wallet),
    isLoading: isMutating,
    error,
  };
}

export function useCreateWallet() {
  const { trigger, data, isMutating, error } = useSWRMutation(
    'createwallet',
    async (_key, { arg }: { arg: string }) => {
      const response = await createwallet(arg);
      await swrMutate('listwalletdir');
      await swrMutate('listwallets');
      return response;
    }
  );

  return {
    response: (data as Createwallet) ?? null,
    create: (wallet: string) => trigger(wallet),
    isLoading: isMutating,
    error,
  };
}

export function useNewAddress() {
  const currentWallet = useWalletStore((state) => state.currentWallet);
  const { trigger, data, error, isMutating } = useSWRMutation(
    'getnewaddress',
    async (_key, { arg }: { arg: { wallet: string; addressType: string } }) => {
      return getnewaddress(arg.wallet, arg.addressType);
    }
  );
  return {
    response: (data as Newaddress) ?? null,
    error,
    isLoading: isMutating,
    generate: (addressType: string) => {
      if (currentWallet === undefined || currentWallet === null) {
        throw new Error('No wallet selected');
      }
      return trigger({ wallet: currentWallet, addressType });
    },
  };
}

export function useSendtoaddress() {
  const currentWallet = useWalletStore((state) => state.currentWallet);
  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    'sendtoaddress',
    async (
      _key,
      { arg }: { arg: { wallet: string; payload: ParamsDictionary } }
    ) => {
      return sendtoaddress(arg.payload, arg.wallet);
    }
  );
  return {
    response: (data as Sendtoaddress) ?? null,
    error,
    isLoading: isMutating,
    send: (payload: ParamsDictionary) => {
      if (currentWallet === undefined || currentWallet === null) {
        throw new Error('No wallet selected');
      }
      return trigger({ wallet: currentWallet, payload });
    },
    clear: () => {
      reset();
    },
  };
}

export function useSendAdvanced() {
  const currentWallet = useWalletStore((state) => state.currentWallet);
  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    'send-advanced',
    async (
      _key,
      { arg }: { arg: { wallet: string; payload: ParamsDictionary } }
    ) => {
      const { wallet, payload } = arg;
      const res1: Createrawtransaction = await createrawtransaction(
        payload,
        wallet
      );
      if (res1 && res1.error) {
        const message = res1.error.message ?? JSON.stringify(res1.error);
        throw new Error(`createrawtransaction failed: ${message}`);
      }
      const signPayload: ParamsDictionary = { hexstring: res1.result ?? '' };
      const res2: Signrawtransactionwithwallet =
        await signrawtransactionwithwallet(signPayload, wallet);
      if (res2 && res2.error) {
        const message = res2.error.message ?? JSON.stringify(res2.error);
        throw new Error(`signrawtransactionwithwallet failed: ${message}`);
      }
      if (!res2?.result?.hex) {
        throw new Error('signrawtransactionwithwallet returned no hex');
      }
      const res3: BroadcastResponse = await sendrawtransaction(
        { hexstring: res2.result.hex },
        wallet
      );
      if (res3 && res3.error) {
        const message = res3.error.message ?? JSON.stringify(res3.error);
        throw new Error(`sendrawtransaction failed: ${message}`);
      }
      return res3.result ?? '';
    }
  );
  return {
    result: (data as string) ?? null,
    error,
    errorMessage: error
      ? error instanceof Error
        ? error.message
        : (() => {
            try {
              return JSON.stringify(error);
            } catch {
              return String(error);
            }
          })()
      : null,
    isLoading: isMutating,
    run: (payload: ParamsDictionary) => {
      if (currentWallet === undefined || currentWallet === null) {
        throw new Error('No wallet selected');
      }
      return trigger({ wallet: currentWallet, payload });
    },
    clear: () => {
      reset();
    },
  };
}

export function useBumpfee() {
  const currentWallet = useWalletStore((state) => state.currentWallet);
  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    'bumpfee',
    async (
      _key,
      { arg }: { arg: { wallet: string; payload: ParamsDictionary } }
    ) => {
      return bumpfee(arg.payload, arg.wallet);
    }
  );
  return {
    response: (data as Bumpfee) ?? null,
    error,
    isLoading: isMutating,
    bump: (payload: ParamsDictionary) => {
      if (currentWallet === undefined || currentWallet === null) {
        throw new Error('No wallet selected');
      }
      return trigger({ wallet: currentWallet, payload });
    },
    clear: () => {
      reset();
    },
  };
}