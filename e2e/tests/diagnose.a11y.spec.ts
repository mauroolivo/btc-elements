import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

import { getE2EConfig } from '../config/testConfig';
import { test, expect } from '../fixtures/test';

type AxeTags = string[];

async function waitForUiToSettle(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {
    // Some dashboards keep background polling/websocket activity alive.
  });
  await page.evaluate(async () => {
    const animations = document.getAnimations();
    if (!animations.length) {
      return;
    }

    const finiteAnimations = animations.filter((animation) => {
      const timing = animation.effect?.getComputedTiming();
      return Boolean(timing && Number.isFinite(timing.iterations));
    });

    await Promise.allSettled(
      finiteAnimations.map((animation) =>
        Promise.race([
          animation.finished,
          new Promise<void>((resolve) => setTimeout(resolve, 1200)),
        ])
      )
    );
  });
}

async function logViolations(pageName: string, page: Page, tags?: AxeTags) {
  await waitForUiToSettle(page);
  const builder = new AxeBuilder({ page });
  const results = tags
    ? await builder.withTags(tags).analyze()
    : await builder.analyze();

  console.log(
    `\n[A11Y] ${pageName}: ${results.violations.length} violation(s)`
  );

  for (const violation of results.violations) {
    console.log(
      `[A11Y] rule=${violation.id} impact=${violation.impact} help=${violation.help}`
    );

    for (const node of violation.nodes.slice(0, 6)) {
      console.log(
        `[A11Y] target=${JSON.stringify(node.target)} summary=${(node.failureSummary ?? '').split('\n')[1] ?? ''}`
      );
    }
  }

  // Diagnostic test: keep green while surfacing full violation details in logs.
  expect(results.violations.length).toBeGreaterThanOrEqual(0);
}

test('diagnose home and my-wallets axe violations', async ({
  page,
  request,
  signInPage,
}) => {
  test.setTimeout(60_000);

  const config = getE2EConfig();
  const credentialsResponse = await request.get(config.auth.credentialsApi);

  test.skip(!credentialsResponse.ok(), 'Demo credentials endpoint unavailable');

  const credentials = (await credentialsResponse.json()) as {
    email?: string;
    password?: string;
  };

  test.skip(
    !credentials.email || !credentials.password,
    'Demo credentials unavailable'
  );

  await signInPage.open();
  await signInPage.signInWithCredentials(
    credentials.email!,
    credentials.password!
  );
  await expect(page).toHaveURL(new RegExp(config.routes.myWallets));

  let currentPageName = 'home-after-login';
  const checkA11y = async (tags: AxeTags) => {
    await logViolations(currentPageName, page, tags);
  };

  await page.goto(config.routes.home);
  currentPageName = 'home-after-login';
  await checkA11y(['wcag21aa', 'best-practice']);

  await page.goto(config.routes.myWallets);
  currentPageName = 'my-wallets';
  await checkA11y(['wcag21aa', 'best-practice']);
});
