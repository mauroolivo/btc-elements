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
    return this.main.locator('input[name="ref"]').last();
  }

  get searchButton(): Locator {
    return this.main.locator('button:has-text("Search")').last();
  }

  get clearButton(): Locator {
    return this.main.locator('button:has-text("Clear")').last();
  }
}
