import { test as base, expect } from '@playwright/test';

import { BasePage } from '../pages/basePage';
import { ExplorerPage } from '../pages/explorerPage';
import { HomePage } from '../pages/homePage';

type Fixtures = {
  basePage: BasePage;
  homePage: HomePage;
  explorerPage: ExplorerPage;
};

export const test = base.extend<Fixtures>({
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  explorerPage: async ({ page }, use) => {
    await use(new ExplorerPage(page));
  },
});

export { expect };
