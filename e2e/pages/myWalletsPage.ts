import type { Locator } from '@playwright/test';

import { BasePage } from './basePage';

export class MyWalletsPage extends BasePage {
  async open() {
    await this.goto('/my-wallets');
  }

  get title(): Locator {
    return this.page.getByRole('heading', { name: /wallet/i });
  }

  get loadingState(): Locator {
    return this.page.locator('text=Checking your wallets');
  }

  get emptyState(): Locator {
    return this.page.locator('text=No wallets found');
  }
}
