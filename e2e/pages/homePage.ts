import type { Locator } from '@playwright/test';

import { BasePage } from './basePage';

export class HomePage extends BasePage {
  async open() {
    await this.goto('/');
  }

  get title(): Locator {
    return this.page.getByRole('heading', {
      name: 'Welcome to the Bitcoin Core UI.',
    });
  }

  get myWalletsLink(): Locator {
    return this.main.getByRole('link', { name: 'My Wallets', exact: true });
  }

  get explorerLink(): Locator {
    return this.main.locator('a[href="/explorer"]');
  }

  get demoWalletButton(): Locator {
    return this.main.getByRole('button', {
      name: '👉 One Click Demo Wallet',
      exact: true,
    });
  }
}
