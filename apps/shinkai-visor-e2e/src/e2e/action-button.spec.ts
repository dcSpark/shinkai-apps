import { expect,test } from '../fixtures/base';

export const actionButtonTests = () => {
  test('action button appear', async ({ page }) => {
    await page.goto('/');
    const actionButton = page.getByTestId('action-button');
    await expect(actionButton).toBeVisible();
  });
}
