import type { Locator } from '@playwright/test';

import { BasePage } from './basePage';

export class ExplorerPage extends BasePage {
  async open() {
    await this.goto('/explorer');
  }

  get title(): Locator {
    return this.page.getByRole('heading', {
      name: 'Transaction and Blocks Explorer',
    });
  }

  get searchField(): Locator {
    return this.page.locator('input[name="ref"]');
  }

  get searchButton(): Locator {
    return this.page.getByRole('button', { name: 'Search' });
  }

  get clearButton(): Locator {
    return this.page.getByRole('button', { name: 'Clear' });
  }
}
