import { test, expect } from '../fixtures/test';

test('shows authenticated navigation state', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/');

  await expect(
    authenticatedPage.getByRole('button', { name: 'Log out' })
  ).toBeVisible();
  await expect(
    authenticatedPage.getByRole('link', { name: 'Profile' })
  ).toBeVisible();
});
