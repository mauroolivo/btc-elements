import '@testing-library/jest-dom';
import { useWalletStore } from '@features/wallet/store';

/**
 * Global test setup: clean up after each test to prevent state leakage.
 */

// Reset Zustand wallet store after each test
afterEach(() => {
  useWalletStore.setState({
    currentWallet: null,
    targetWallet: null,
  });
});

// Clear all mocks and timers after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Silence console errors during tests (can be toggled per test if needed)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
        args[0].includes('act'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
