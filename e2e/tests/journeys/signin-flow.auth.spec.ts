import { test, expect } from '../../fixtures/test';

test('user can sign in and reach my-wallets page', async ({
  page,
  signInPage,
  request,
}) => {
  const config = await import('../../config/testConfig').then((m) =>
    m.getE2EConfig()
  );
  const credentialsResponse = await request.get(config.auth.credentialsApi);

  test.skip(!credentialsResponse.ok(), 'Demo credentials endpoint unavailable');

  const credentials = (await credentialsResponse.json()) as {
    email?: string;
    password?: string;
  };

  test.skip(
    !credentials.email || !credentials.password,
    'Demo credentials unavailable'
  );

  await signInPage.open();
  await expect(signInPage.testPage).toHaveURL(new RegExp(config.routes.signIn));

  await signInPage.signInWithCredentials(
    credentials.email!,
    credentials.password!
  );

  await expect(page).toHaveURL(new RegExp(config.routes.myWallets));
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
});
