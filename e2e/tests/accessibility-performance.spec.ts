import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

import { test, expect } from '../fixtures/test';

type PageVitals = {
  lcp: number | null;
  cls: number;
  fcp: number | null;
  ttfb: number | null;
};

const perfThresholds = {
  lcp: 8000,
  cls: 0.2,
  fcp: 5000,
  ttfb: 2000,
};

async function installVitalsObservers(page: Page) {
  await page.addInitScript(() => {
    const globalWithVitals = window as typeof window & {
      __pwVitals?: {
        lcp: number | null;
        cls: number;
      };
    };

    globalWithVitals.__pwVitals = {
      lcp: null,
      cls: 0,
    };

    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as
        | PerformanceEntry
        | undefined;

      if (lastEntry?.startTime != null && globalWithVitals.__pwVitals) {
        globalWithVitals.__pwVitals.lcp = lastEntry.startTime;
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as Array<
        PerformanceEntry & { value?: number; hadRecentInput?: boolean }
      >) {
        if (
          !entry.hadRecentInput &&
          entry.value &&
          globalWithVitals.__pwVitals
        ) {
          globalWithVitals.__pwVitals.cls += entry.value;
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
}

async function readVitals(page: Page): Promise<PageVitals> {
  return page.evaluate(() => {
    const globalWithVitals = window as typeof window & {
      __pwVitals?: {
        lcp: number | null;
        cls: number;
      };
    };

    const navigationEntry = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    const firstContentfulPaint = performance
      .getEntriesByType('paint')
      .find((entry) => entry.name === 'first-contentful-paint');

    return {
      lcp: globalWithVitals.__pwVitals?.lcp ?? null,
      cls: globalWithVitals.__pwVitals?.cls ?? 0,
      fcp: firstContentfulPaint?.startTime ?? null,
      ttfb: navigationEntry?.responseStart ?? null,
    } satisfies PageVitals;
  });
}

test('home page has no critical accessibility violations', async ({
  homePage,
}) => {
  await homePage.open();
  await expect(homePage.title).toBeVisible();

  const accessibilityScanResults = await new AxeBuilder({
    page: homePage.testPage,
  })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  const seriousOrCriticalViolations =
    accessibilityScanResults.violations.filter(
      (violation) =>
        violation.impact === 'serious' || violation.impact === 'critical'
    );

  expect(seriousOrCriticalViolations).toEqual([]);
});

test('home route stays within pragmatic vitals thresholds', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'Performance thresholds run only on desktop chromium to reduce variance.'
  );

  await installVitalsObservers(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const vitals = await readVitals(page);

  expect(vitals.lcp).not.toBeNull();
  expect(vitals.fcp).not.toBeNull();
  expect(vitals.ttfb).not.toBeNull();

  expect(vitals.lcp!).toBeLessThan(perfThresholds.lcp);
  expect(vitals.cls).toBeLessThan(perfThresholds.cls);
  expect(vitals.fcp!).toBeLessThan(perfThresholds.fcp);
  expect(vitals.ttfb!).toBeLessThan(perfThresholds.ttfb);
});
