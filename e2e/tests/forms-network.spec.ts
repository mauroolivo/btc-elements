import { test, expect } from '../fixtures/test';

test('sign-in form shows validation errors for invalid credentials input', async ({
  signInPage,
}) => {
  await signInPage.open();
  await expect(signInPage.testPage).toHaveURL(/\/auth\/signin/);

  await signInPage.submitButton.click();

  await expect(
    signInPage.testPage.getByText('Enter a valid email address')
  ).toBeVisible();
  await expect(
    signInPage.testPage.getByText('Password must be at least 6 characters long')
  ).toBeVisible();

  await signInPage.emailInput.fill('invalid-email');
  await signInPage.passwordInput.fill('123');
  await signInPage.submitButton.click();

  await expect(
    signInPage.testPage.getByText('Enter a valid email address')
  ).toBeVisible();
  await expect(
    signInPage.testPage.getByText('Password must be at least 6 characters long')
  ).toBeVisible();
});

test('chart page shows deterministic error state when coin-gecko api is mocked to fail', async ({
  chartPage,
}) => {
  let interceptedCalls = 0;

  await chartPage.testPage.route('**/api/coin-gecko**', async (route) => {
    interceptedCalls += 1;
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'mocked coin-gecko failure' }),
    });
  });

  await chartPage.open();
  await expect(chartPage.title).toBeVisible();
  await expect(chartPage.errorState).toBeVisible();
  await expect.poll(() => interceptedCalls).toBeGreaterThan(0);
});
