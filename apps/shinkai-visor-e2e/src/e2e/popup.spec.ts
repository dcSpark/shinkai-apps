import { FrameLocator } from '@playwright/test';

import { expect, test } from '../fixtures/base';

let popupIframe: FrameLocator;
test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('/');
  // eslint-disable-next-line playwright/no-networkidle
  await page.waitForLoadState('networkidle');
  popupIframe = page.frameLocator('#popup-iframe');
  await expect(popupIframe).toBeDefined();
});

test('popup should be initially hidden', async ({ page }) => {
  const popup = popupIframe.getByTestId('popup');
  await expect(popup).toBeHidden();
});

test('popup appear after press action button', async ({ page }) => {
  const actionButton = page.getByTestId('action-button');
  await actionButton.click();

  const popup = popupIframe.getByTestId('popup');
  await expect(popup).toBeVisible();
});
