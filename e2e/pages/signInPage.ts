import type { Locator, Page } from '@playwright/test';

import { getE2EConfig } from '../config/testConfig';
import { BasePage } from './basePage';

export class SignInPage extends BasePage {
  private readonly config = getE2EConfig();

  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto(this.config.routes.signIn);
  }

  get emailInput(): Locator {
    return this.page.locator('#signin-email');
  }

  get passwordInput(): Locator {
    return this.page.locator('#signin-password');
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign in', exact: true });
  }

  async signInWithCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
