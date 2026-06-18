import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SWRConfig } from 'swr';

/**
 * Mock implementation of Next.js useRouter hook.
 * Returns a mutable router object that can be controlled in tests.
 */
export const createMockRouter = (overrides = {}) => ({
  push: jest.fn().mockResolvedValue(true),
  replace: jest.fn().mockResolvedValue(true),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  ...overrides,
});

type MockRouter = ReturnType<typeof createMockRouter>;

type TestGlobals = typeof globalThis & {
  __mockRouter?: MockRouter;
  __mockSearchParams?: URLSearchParams;
};

/**
 * Mock implementation of Next.js useSearchParams hook.
 * Returns URLSearchParams that can be queried in tests.
 */
export const createMockSearchParams = (
  initialParams: Record<string, string> = {}
) => {
  const params = new URLSearchParams();
  Object.entries(initialParams).forEach(([key, value]) => {
    params.set(key, value);
  });
  return params;
};

/**
 * Custom render function that wraps components with SWR isolation.
 * Each test gets its own SWR cache to prevent data leakage between tests.
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Pass optional router overrides for Next.js route testing
  routerOverrides?: Record<string, unknown>;
  // Pass optional search params for Next.js query testing
  searchParamsOverrides?: Record<string, string>;
}

export const renderWithProviders = (
  ui: ReactElement,
  {
    routerOverrides = {},
    searchParamsOverrides = {},
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const mockRouter = createMockRouter(routerOverrides);
  const mockSearchParams = createMockSearchParams(searchParamsOverrides);
  const testGlobals = globalThis as TestGlobals;

  // Set mocks into global scope so components can access them
  testGlobals.__mockRouter = mockRouter;
  testGlobals.__mockSearchParams = mockSearchParams;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      {children}
    </SWRConfig>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    mockRouter,
    mockSearchParams,
  };
};

/**
 * Mock fetch implementation for testing API calls.
 * Allows mocking specific endpoints without hitting the network.
 */
export const createMockFetch = (responses: Record<string, unknown> = {}) => {
  return jest.fn((url: string) => {
    const matchedUrl = Object.keys(responses).find((key) => url.includes(key));
    if (matchedUrl) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses[matchedUrl]),
      } as Response);
    }
    return Promise.reject(new Error(`No mock found for ${url}`));
  });
};

export * from '@testing-library/react';
