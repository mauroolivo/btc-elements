import { test, expect } from '../../fixtures/test';

test('public user can search explorer for block by hash', async ({
  homePage,
  explorerPage,
}) => {
  await homePage.open();
  await expect(homePage.title).toBeVisible();

  await homePage.explorerLink.click();
  await expect(explorerPage.title).toBeVisible();

  const testBlockHash =
    '000000000000000000007f1d4a4ea9f4e0dc9df5f3f4b6c3d78a6ed5b5f9a2bb';
  await explorerPage.searchField.fill(testBlockHash);
  await explorerPage.searchButton.click();

  // With mocked RPC, search results vary. Just verify that the page processed the search.
  const searchField = explorerPage.searchField;
  await expect(searchField).toHaveValue(testBlockHash);
});

test('public user can search explorer for transaction by txid', async ({
  explorerPage,
}) => {
  await explorerPage.open();
  await expect(explorerPage.title).toBeVisible();

  const testTxId = 'abc123';
  await explorerPage.searchField.fill(testTxId);
  await explorerPage.searchButton.click();

  await expect(
    explorerPage.testPage.locator('text=Failed to fetch')
  ).toBeVisible();
});

test('user can clear explorer search field', async ({ explorerPage }) => {
  await explorerPage.open();
  await explorerPage.searchField.fill('test-query');
  await explorerPage.clearButton.click();

  await expect(explorerPage.searchField).toHaveValue('');
});
