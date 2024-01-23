import {
  type BrowserContext,
  chromium,
  FrameLocator,
  Locator,
  test as base,
} from '@playwright/test';
import * as path from 'path';

process.env.PW_CHROMIUM_ATTACH_TO_OTHER = '1';
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
    console.log(
      `page configured and extension is installed extensionId:${extensionId}`,
    );
    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');
    await use(page);
  },
  actionButton: async ({ page }, use) => {
    const actionButton = page.getByTestId('action-button');
    await expect(actionButton).toBeDefined();
    await use(actionButton);
  },
  popup: async ({ page, actionButton, extensionId }, use) => {
    await actionButton.click();
    // index 0 is the main page shinkai website, 1 is a blank page
    const sidePanelExtension = page.context().pages()[2]; //
    console.log(sidePanelExtension, 'extension');

    //
    // await page.goto(
    //   `chrome-extension://${extensionId}/src/components/popup/popup.html`,
    // );
    // await expect(popup).toBeDefined();
  },
});
export const expect = test.expect;
