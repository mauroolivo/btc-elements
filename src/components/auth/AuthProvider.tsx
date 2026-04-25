'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  type AuthProvider as FirebaseAuthProvider,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase/client';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  loginWithGithub: () => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  register: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getProviderLabel(method: string) {
  if (method === GoogleAuthProvider.PROVIDER_ID) {
    return 'Google';
  }

  if (method === GithubAuthProvider.PROVIDER_ID) {
    return 'GitHub';
  }

  if (method === 'password') {
    return 'email and password';
  }

  return method;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const githubProvider = new GithubAuthProvider();
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    return signInWithEmailAndPassword(firebaseAuth, email, password);
  }

  async function signInWithSocialProvider(provider: FirebaseAuthProvider) {
    try {
      return await signInWithPopup(firebaseAuth, provider);
    } catch (error) {
      const authError = error as Error & {
        code?: string;
        customData?: { email?: string };
      };

      if (
        authError.code === 'auth/account-exists-with-different-credential' &&
        authError.customData?.email
      ) {
        const methods = await fetchSignInMethodsForEmail(
          firebaseAuth,
          authError.customData.email
        );

        if (methods.length > 0) {
          const providerList = methods.map(getProviderLabel).join(' or ');

          throw new Error(
            `An account already exists for ${authError.customData.email}. Sign in with ${providerList} instead, then link this provider later if needed.`
          );
        }
      }

      throw error;
    }
  }

  async function loginWithGoogle() {
    return signInWithSocialProvider(googleProvider);
  }

  async function loginWithGithub() {
    return signInWithSocialProvider(githubProvider);
  }

  async function register(email: string, password: string) {
    return createUserWithEmailAndPassword(firebaseAuth, email, password);
  }

  async function logout() {
    await signOut(firebaseAuth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGithub,
        loginWithGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
