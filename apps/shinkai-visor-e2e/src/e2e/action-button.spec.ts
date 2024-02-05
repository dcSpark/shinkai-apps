import { expect, test } from '../fixtures/base';

export const actionButtonTests = () => {
  test.beforeEach(async ({ page }) => {});
  test('action button appear for sidepanel test', async ({ actionButton }) => {
    await expect(actionButton).toBeVisible();
  });
};
