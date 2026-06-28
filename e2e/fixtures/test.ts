import { existsSync } from 'node:fs';
import type { BrowserContext, Page } from '@playwright/test';
import { test as base, expect } from '@playwright/test';

import { getAuthStatePath, getE2EConfig } from '../config/testConfig';
import { BasePage } from '../pages/basePage';
import { ExplorerPage } from '../pages/explorerPage';
import { HomePage } from '../pages/homePage';
import { MyWalletsPage } from '../pages/myWalletsPage';
import { SignInPage } from '../pages/signInPage';

type Fixtures = {
  authStatePath: string;
  basePage: BasePage;
  homePage: HomePage;
  explorerPage: ExplorerPage;
  signInPage: SignInPage;
  myWalletsPage: MyWalletsPage;
  authenticatedContext: BrowserContext;
  authenticatedPage: Page;
  authenticatedHomePage: HomePage;
};

export const test = base.extend<Fixtures>({
  authStatePath: async ({}, use) => {
    await use(getAuthStatePath());
  },
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  explorerPage: async ({ page }, use) => {
    await use(new ExplorerPage(page));
  },
  signInPage: async ({ page }, use) => {
    await use(new SignInPage(page));
  },
  myWalletsPage: async ({ page }, use) => {
    await use(new MyWalletsPage(page));
  },
  authenticatedContext: async ({ authStatePath, baseURL, browser }, use) => {
    if (!existsSync(authStatePath)) {
      throw new Error(
        `Missing auth state file at ${authStatePath}. Run \"npm run test:e2e:setup-auth\" first.`
      );
    }

    const context = await browser.newContext({
      baseURL,
      storageState: authStatePath,
    });

    await use(context);
    await context.close();
  },
  authenticatedPage: async (
    { authenticatedContext, request, authStatePath },
    use
  ) => {
    const page = await authenticatedContext.newPage();

    await page.goto('/');
    const logoutButton = page.getByRole('button', { name: 'Log out' });

    if (!(await logoutButton.isVisible())) {
      const config = getE2EConfig();
      const credentialsResponse = await request.get(config.auth.credentialsApi);

      if (!credentialsResponse.ok()) {
        throw new Error(
          'Unable to fetch demo credentials from the credentials API for authenticated Playwright fixtures.'
        );
      }

      const credentials = (await credentialsResponse.json()) as {
        email?: string;
        password?: string;
      };

      if (!credentials.email || !credentials.password) {
        throw new Error(
          'Demo credentials payload is missing email or password.'
        );
      }

      const signInPage = new SignInPage(page);
      await signInPage.open();
      await signInPage.signInWithCredentials(
        credentials.email,
        credentials.password
      );
      await expect(page).toHaveURL(new RegExp(`${config.routes.myWallets}$`));
      await authenticatedContext.storageState({ path: authStatePath });
      await page.goto('/');
    }

    await use(page);
  },
  authenticatedHomePage: async ({ authenticatedPage }, use) => {
    await use(new HomePage(authenticatedPage));
  },
});

export { expect };
