import React, { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test-utils';
import { AuthProvider, useAuth } from './AuthProvider';
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

jest.mock('@/lib/firebase/client', () => ({
  firebaseAuth: { name: 'mock-auth' },
}));

jest.mock('firebase/auth', () => {
  class MockGoogleAuthProvider {
    static PROVIDER_ID = 'google.com';
  }

  class MockGithubAuthProvider {
    static PROVIDER_ID = 'github.com';
  }

  return {
    GoogleAuthProvider: MockGoogleAuthProvider,
    GithubAuthProvider: MockGithubAuthProvider,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signInWithPopup: jest.fn(),
    fetchSignInMethodsForEmail: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  };
});

const mockedOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<
  typeof onAuthStateChanged
>;
const mockedSignInWithEmailAndPassword =
  signInWithEmailAndPassword as jest.MockedFunction<
    typeof signInWithEmailAndPassword
  >;
const mockedSignInWithPopup = signInWithPopup as jest.MockedFunction<
  typeof signInWithPopup
>;
const mockedFetchSignInMethodsForEmail =
  fetchSignInMethodsForEmail as jest.MockedFunction<
    typeof fetchSignInMethodsForEmail
  >;
const mockedCreateUserWithEmailAndPassword =
  createUserWithEmailAndPassword as jest.MockedFunction<
    typeof createUserWithEmailAndPassword
  >;
const mockedSignOut = signOut as jest.MockedFunction<typeof signOut>;

function AuthConsumer() {
  const auth = useAuth();
  const [error, setError] = useState('');

  return (
    <div>
      <div data-testid="loading-state">
        {auth.loading ? 'loading' : 'ready'}
      </div>
      <button
        type="button"
        onClick={() => {
          void auth.login('user@example.com', 'secret123');
        }}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => {
          void auth.register('new@example.com', 'strongpass');
        }}
      >
        Register
      </button>
      <button
        type="button"
        onClick={() => {
          void auth.logout();
        }}
      >
        Logout
      </button>
      <button
        type="button"
        onClick={() => {
          void auth.loginWithGoogle().catch((nextError: Error) => {
            setError(nextError.message);
          });
        }}
      >
        Google
      </button>
      <button
        type="button"
        onClick={() => {
          void auth.loginWithGithub();
        }}
      >
        Github
      </button>
      <div data-testid="auth-error">{error}</div>
    </div>
  );
}

describe('AuthProvider (functional)', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedOnAuthStateChanged.mockImplementation((_auth, callback) => {
      if (typeof callback === 'function') {
        callback(null);
      } else {
        callback.next?.(null);
      }

      return jest.fn();
    });

    mockedSignInWithEmailAndPassword.mockResolvedValue({} as never);
    mockedCreateUserWithEmailAndPassword.mockResolvedValue({} as never);
    mockedSignOut.mockResolvedValue(undefined);
    mockedSignInWithPopup.mockResolvedValue({} as never);
    mockedFetchSignInMethodsForEmail.mockResolvedValue([]);
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const OutsideConsumer = () => {
      useAuth();
      return null;
    };

    expect(() => render(<OutsideConsumer />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
  });

  it('exposes login/register/logout and calls firebase auth methods', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('ready');
    });

    await user.click(screen.getByRole('button', { name: 'Login' }));
    await user.click(screen.getByRole('button', { name: 'Register' }));
    await user.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(mockedSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'user@example.com',
        'secret123'
      );
      expect(mockedCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'new@example.com',
        'strongpass'
      );
      expect(mockedSignOut).toHaveBeenCalledWith(expect.anything());
    });
  });

  it('maps account-exists-with-different-credential errors to helpful provider message', async () => {
    const user = userEvent.setup();

    mockedSignInWithPopup.mockRejectedValueOnce({
      code: 'auth/account-exists-with-different-credential',
      customData: { email: 'alice@example.com' },
    } as never);
    mockedFetchSignInMethodsForEmail.mockResolvedValueOnce([
      'google.com',
      'password',
    ]);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Google' }));

    await waitFor(() => {
      expect(screen.getByTestId('auth-error')).toHaveTextContent(
        'An account already exists for alice@example.com. Sign in with Google or email and password instead, then link this provider later if needed.'
      );
    });
  });
});
