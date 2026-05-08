'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@features/auth/useAuth';
import { useWalletStore } from '@features/wallet/store/useWalletStore';
import { useCreateWallet, useWalletsDir } from '@features/wallet/hooks/hooks';
import { getUserWallets } from '@/lib/firebase/wallets';

const DEMO_ACCOUNT_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? '';

type UseDemoWalletAccessOptions = {
  onBlockedAccount?: (accountLabel: string) => void;
};

export function useDemoWalletAccess(options?: UseDemoWalletAccessOptions) {
  const router = useRouter();
  const { user, login } = useAuth();
  const { setTargetWallet } = useWalletStore();
  const { create: createRpcWallet } = useCreateWallet();
  const { listwalletdir, refresh: refreshWalletDir } = useWalletsDir();
  const [isDemoOpening, setIsDemoOpening] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  async function openDemoWalletForUser(userId: string) {
    const wallets = await getUserWallets(userId);

    if (wallets.length === 0 || !wallets[0].id) {
      setDemoError('Demo wallet is not available right now.');
      return;
    }

    const walletId = wallets[0].id;
    const walletExistsInCore = listwalletdir.result.wallets.some(
      (wallet) => wallet.name === walletId
    );

    if (!walletExistsInCore) {
      const created = await createRpcWallet(walletId);

      if (created?.error) {
        const rpcErrorText = JSON.stringify(created.error).toLowerCase();

        if (!rpcErrorText.includes('already exists')) {
          setDemoError('Demo wallet is not available right now.');
          return;
        }
      }

      await refreshWalletDir();
    }

    setTargetWallet(walletId);
    router.push('/wallet');
  }

  async function openDemoWallet() {
    if (user) {
      const authenticatedEmail = user.email?.toLowerCase();

      if (authenticatedEmail === DEMO_ACCOUNT_EMAIL) {
        setIsDemoOpening(true);
        setDemoError(null);

        try {
          await openDemoWalletForUser(user.uid);
        } finally {
          setIsDemoOpening(false);
        }

        return;
      }

      const accountLabel = user.email ?? 'an unknown account';
      options?.onBlockedAccount?.(accountLabel);
      return;
    }

    setIsDemoOpening(true);
    setDemoError(null);

    try {
      const credentialsResponse = await fetch('/api/demo-credentials', {
        cache: 'no-store',
      });

      if (!credentialsResponse.ok) {
        return;
      }

      const credentials = (await credentialsResponse.json()) as {
        email?: string;
        password?: string;
      };

      if (!credentials.email || !credentials.password) {
        return;
      }

      const signInResult = await login(credentials.email, credentials.password);
      await openDemoWalletForUser(signInResult.user.uid);
    } catch {
      // Silent fail by request.
    } finally {
      setIsDemoOpening(false);
    }
  }

  return {
    demoAccountEmail: DEMO_ACCOUNT_EMAIL,
    demoError,
    isDemoOpening,
    openDemoWallet,
  };
}
