import type { Locator } from '@playwright/test';

import { BasePage } from './basePage';

export class ChartPage extends BasePage {
  async open() {
    await this.goto('/chart');
  }

  get title(): Locator {
    return this.main.getByRole('heading', { name: 'Chart Page', exact: true });
  }

  get loadingState(): Locator {
    return this.main.getByText('Loading BTC price data…');
  }

  get errorState(): Locator {
    return this.main.locator('text=HTTP 500');
  }

  get chartCanvas(): Locator {
    return this.main.locator('canvas').first();
  }
}
