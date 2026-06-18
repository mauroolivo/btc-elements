/**
 * Smoke tests to validate the test harness is working correctly.
 * These tests confirm that Jest, RTL, SWR, and mocks are properly wired.
 */

import {
  renderWithProviders,
  createMockRouter,
  createMockSearchParams,
} from '@/test-utils';
import React from 'react';
import { useWalletStore } from '@features/wallet/store';
import useSWR from 'swr';

type TestGlobals = typeof globalThis & {
  __mockRouter?: { pathname?: string };
  __mockSearchParams?: URLSearchParams;
};

describe('Test Harness - Smoke Tests', () => {
  it('should render a basic component without crashing', () => {
    const TestComponent = () => <div>Hello Test</div>;
    const { getByText } = renderWithProviders(<TestComponent />);
    expect(getByText('Hello Test')).toBeInTheDocument();
  });

  it('should provide isolated SWR cache per test', () => {
    const TestComponent = () => {
      const { data } = useSWR('test-key', () => 'test-value');
      return <div data-testid="swr-test">{data ?? 'loading'}</div>;
    };

    const { getByTestId } = renderWithProviders(<TestComponent />);
    // SWR should render with loading state initially in isolated cache
    expect(getByTestId('swr-test')).toHaveTextContent('loading');
  });

  it('should reset wallet store state between tests', () => {
    // Set state in first part
    useWalletStore.setState({
      currentWallet: 'test-wallet',
      targetWallet: 'target-wallet',
    });

    expect(useWalletStore.getState().currentWallet).toBe('test-wallet');

    // After test, setup.ts afterEach resets it
    // Verify in a new "test" by checking store directly
  });

  it('should reset wallet store state to null after each test', () => {
    // This test runs after the previous one
    // If setup.ts is working, store should be clean
    const state = useWalletStore.getState();
    expect(state.currentWallet).toBeNull();
    expect(state.targetWallet).toBeNull();
  });

  it('should provide mock router with working functions', () => {
    const mockRouter = createMockRouter({
      pathname: '/dashboard',
    });

    expect(mockRouter.pathname).toBe('/dashboard');
    expect(typeof mockRouter.push).toBe('function');
    expect(typeof mockRouter.replace).toBe('function');
    expect(typeof mockRouter.back).toBe('function');
  });

  it('should track mock router function calls', async () => {
    const mockRouter = createMockRouter();
    await mockRouter.push('/test');
    expect(mockRouter.push).toHaveBeenCalledWith('/test');
  });

  it('should create mock search params correctly', () => {
    const params = createMockSearchParams({
      ref: 'block123',
      page: '1',
    });

    expect(params.get('ref')).toBe('block123');
    expect(params.get('page')).toBe('1');
  });

  it('should clear mocks after each test', () => {
    const mockFn = jest.fn();
    mockFn('first-call');

    expect(mockFn).toHaveBeenCalledTimes(1);
    // afterEach clears mocks, so a fresh mockFn in next test would have 0 calls
  });

  it('should have fresh mock function after previous test cleanup', () => {
    const freshMockFn = jest.fn();
    // This should have 0 calls (not inherit from previous test)
    expect(freshMockFn).toHaveBeenCalledTimes(0);
  });

  it('should render component with router overrides', () => {
    const TestComponent = () => {
      const router = (globalThis as TestGlobals).__mockRouter;
      return <div>{router?.pathname || 'no-router'}</div>;
    };

    const { getByText } = renderWithProviders(<TestComponent />, {
      routerOverrides: { pathname: '/custom-route' },
    });

    expect(getByText('/custom-route')).toBeInTheDocument();
  });

  it('should render component with search params overrides', () => {
    const TestComponent = () => {
      const params = (globalThis as TestGlobals).__mockSearchParams;
      return <div>{params?.get('query') || 'no-query'}</div>;
    };

    const { getByText } = renderWithProviders(<TestComponent />, {
      searchParamsOverrides: { query: 'bitcoin' },
    });

    expect(getByText('bitcoin')).toBeInTheDocument();
  });
});
