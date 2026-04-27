'use client';

import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { firebaseDb } from './client';

export type FirestoreWallet = {
  docId: string;
  id: string;
  name: string;
  createdAt: Timestamp | null;
};

const MAX_WALLETS_PER_USER = 10;

function getWalletsCollection(userId: string) {
  return collection(firebaseDb, 'users', userId, 'wallets');
}

export async function getUserWallets(
  userId: string
): Promise<FirestoreWallet[]> {
  const snapshot = await getDocs(
    query(getWalletsCollection(userId), orderBy('createdAt', 'asc'))
  );

  return snapshot.docs.map((doc) => {
    const data = doc.data() as {
      id?: string;
      name?: string;
      createdAt?: Timestamp;
    };

    return {
      docId: doc.id,
      id: data.id ?? '',
      name: data.name ?? '',
      createdAt: data.createdAt ?? null,
    };
  });
}

export async function getUserWalletById(
  userId: string,
  walletId: string
): Promise<FirestoreWallet | null> {
  const snapshot = await getDocs(
    query(getWalletsCollection(userId), where('id', '==', walletId), limit(1))
  );

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data() as {
    id?: string;
    name?: string;
    createdAt?: Timestamp;
  };

  return {
    docId: doc.id,
    id: data.id ?? '',
    name: data.name ?? '',
    createdAt: data.createdAt ?? null,
  };
}

export async function addUserWallet(userId: string, name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error('Wallet name is required.');
  }

  const existingWallets = await getDocs(
    query(getWalletsCollection(userId), orderBy('createdAt', 'asc'))
  );

  if (existingWallets.size >= MAX_WALLETS_PER_USER) {
    throw new Error('Unable to save wallet.');
  }

  const duplicateSnapshot = await getDocs(
    query(
      getWalletsCollection(userId),
      where('name', '==', trimmedName),
      limit(1)
    )
  );

  if (!duplicateSnapshot.empty) {
    throw new Error('A wallet with this name already exists.');
  }

  const walletId = `${userId}_${existingWallets.size + 1}`;

  await addDoc(getWalletsCollection(userId), {
    id: walletId,
    name: trimmedName,
    createdAt: serverTimestamp(),
  });

  return walletId;
}

export async function deleteUserWalletById(userId: string, walletId: string) {
  const walletSnapshot = await getDocs(
    query(getWalletsCollection(userId), where('id', '==', walletId), limit(1))
  );

  if (walletSnapshot.empty) {
    return;
  }

  await deleteDoc(walletSnapshot.docs[0].ref);
}

export { MAX_WALLETS_PER_USER };
