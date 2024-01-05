import { FrameLocator } from '@playwright/test';

import { expect, test } from '../fixtures/base';

let popupIframe: FrameLocator;
test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('/');
  // eslint-disable-next-line playwright/no-networkidle
  await page.waitForLoadState('networkidle');
  popupIframe = page.frameLocator('#popup-iframe');
  await expect(popupIframe).toBeDefined();
  const actionButton = page.getByTestId('action-button');
  await actionButton.click();
});

test('welcome should be the first page', async ({ page }) => {
  const tosLink = popupIframe.getByTestId('terms-of-service-link');
  const ppLink = popupIframe.getByTestId('privacy-policy-link');

  await expect(tosLink).toBeVisible();
  await expect(tosLink).toHaveAttribute('href', 'https://www.shinkai.com/terms-of-service');
  await expect(ppLink).toBeVisible();
  await expect(ppLink).toHaveAttribute('href', 'https://www.shinkai.com/privacy-policy');
});

test('terms button should start unchecked', async ({ page }) => {
  const termsInput = popupIframe.getByTestId('terms');
  await expect(termsInput).toHaveAttribute('data-state', 'unchecked');
});

test('terms button start should be able to change', async ({ page }) => {
  const termsInput = popupIframe.getByTestId('terms');
  await expect(termsInput).toHaveAttribute('data-state', 'unchecked');
  await termsInput.click();
  await expect(termsInput).toHaveAttribute('data-state', 'checked');
});

test('get started button start disabled', async ({ page }) => {
  const getStartedButton = popupIframe.getByTestId('get-started-button');
  await expect(getStartedButton).toHaveAttribute('disabled');
});

test('get started button should be enabled when terms are accepted', async ({ page }) => {
  const termsInput = popupIframe.getByTestId('terms');
  await termsInput.click();

  const getStartedButton = popupIframe.getByTestId('get-started-button');
  await expect(getStartedButton).not.toHaveAttribute('disabled');
});
