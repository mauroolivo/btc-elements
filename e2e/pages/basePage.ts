import type { Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  get testPage(): Page {
    return this.page;
  }

  async goto(pathname: string) {
    await this.page.goto(pathname);
  }

  get main() {
    return this.page.locator('#main-content');
  }
}
