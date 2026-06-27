import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { test, expect } from '@playwright/test';

import { getAuthStatePath, getE2EConfig } from '../config/testConfig';
import { SignInPage } from '../pages/signInPage';

test('persists demo user auth state', async ({ page, request }) => {
  const config = getE2EConfig();
  const credentialsResponse = await request.get(config.auth.credentialsApi);

  test.skip(
    !credentialsResponse.ok(),
    'Demo credentials API is unavailable. Set NEXT_PUBLIC_DEMO_EMAIL and DEMO_PASSWORD to enable auth setup.'
  );

  const credentials = (await credentialsResponse.json()) as {
    email?: string;
    password?: string;
  };

  test.skip(
    !credentials.email || !credentials.password,
    'Demo credentials are missing email or password.'
  );

  const signInPage = new SignInPage(page);
  await signInPage.open();
  await signInPage.signInWithCredentials(
    credentials.email!,
    credentials.password!
  );

  await expect(page).toHaveURL(new RegExp(`${config.routes.myWallets}$`));

  const authStatePath = getAuthStatePath();
  mkdirSync(dirname(authStatePath), { recursive: true });
  await page.context().storageState({ path: authStatePath });
});
