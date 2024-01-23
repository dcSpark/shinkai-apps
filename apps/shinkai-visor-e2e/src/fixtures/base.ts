import {
  type BrowserContext,
  chromium,
  Locator,
  Page,
  test as base,
} from '@playwright/test';
import * as path from 'path';

import { waitFor } from '../utils/test-utils';

/*
  This ENV variable is really important to allow Playwirght to get access to the popup page running in a Chrome side panel
  We got this workaround from: https://github.com/microsoft/playwright/issues/26693
*/
process.env.PW_CHROMIUM_ATTACH_TO_OTHER = '1';

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  popup: Page;
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
    let popupPage: Page | undefined = undefined;
    await waitFor(
      async () => {
        popupPage = page
          .context()
          .pages()
          .find((value) => value.url().match(extensionId));
        await expect(popupPage).toBeDefined();
      },
      500,
      1000,
    );
    await use(popupPage);
  },
});
export const expect = test.expect;
