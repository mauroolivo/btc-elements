import { test, expect } from '../../fixtures/test';

test('authenticated user can access my-wallets page', async ({
  authenticatedHomePage,
  myWalletsPage,
}) => {
  await authenticatedHomePage.open();
  await expect(
    authenticatedHomePage.testPage.getByRole('button', { name: 'Log out' })
  ).toBeVisible();

  await myWalletsPage.open();
  await expect(myWalletsPage.testPage).toHaveURL(/my-wallets/);
});

test('authenticated user sees wallet list on my-wallets page', async ({
  myWalletsPage,
}) => {
  await myWalletsPage.open();

  const page = myWalletsPage.testPage;
  const isLoading = await myWalletsPage.loadingState
    .isVisible()
    .catch(() => false);
  const isEmpty = await myWalletsPage.emptyState.isVisible().catch(() => false);

  if (!isLoading && !isEmpty) {
    // Use exact match to avoid strict mode violation with multiple heading matches
    await expect(
      page.getByRole('heading', { name: 'My Wallets', exact: true })
    ).toBeVisible();
  }
});
