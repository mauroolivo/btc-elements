import { test, expect } from '../fixtures/test';

test('renders the home page shell', async ({ homePage }) => {
  await homePage.open();

  await expect(homePage.main).toBeVisible();
  await expect(homePage.title).toBeVisible();
  await expect(homePage.myWalletsLink).toBeVisible();
  await expect(homePage.explorerLink).toBeVisible();
  await expect(homePage.demoWalletButton).toBeVisible();
});
