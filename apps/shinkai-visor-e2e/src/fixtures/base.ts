import { type BrowserContext, chromium, FrameLocator,Locator, test as base } from '@playwright/test';
import * as path from 'path';

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  popup: FrameLocator;
  actionButton: Locator;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const pathToExtension = path.join(
      __dirname,
      '../../../../dist/apps/shinkai-visor',
    );
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        ...[process.env.CI ? '--headless=new' : ''],
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // for manifest v3:
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
  page: async ({ page, extensionId }, use) => {
    await page.goto('/');
    console.log(`page configured and extension is installed extensionId:${extensionId}`);
    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');
    await use(page);
  },
  actionButton: async ({ context, page, popup }, use) => {
    const actionButton = page.getByTestId('action-button');
    await expect(actionButton).toBeDefined();
    await use(actionButton);
  },
  popup: async ({ context, page }, use) => {
    const popupIframe = page.frameLocator('#popup-iframe');
    await expect(popupIframe).toBeDefined();
    await use(popupIframe);
  }
});
export const expect = test.expect;
