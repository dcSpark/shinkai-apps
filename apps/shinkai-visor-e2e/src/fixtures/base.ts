import {
  type BrowserContext,
  chromium,
  Page,
  test as base,
  Worker,
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
  worker: Worker;
  extensionId: string;
  popup: Page;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    console.log('Start context fixture');
    const pathToExtension = path.join(
      __dirname,
      '../../../../dist/apps/shinkai-visor',
    );
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        ...['--headless=new'],
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
    console.log('End context fixture');
  },
  worker: async ({ context }, use) => {
    console.log('Start worker fixture');
    // for manifest v3:
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');
    await use(background);
    console.log('End worker fixture');
  },
  extensionId: async ({ worker }, use) => {
    console.log('Start extensionId fixture');
    const extensionId = worker.url().split('/')[2];
    console.log(`extension is installed extensionId:${extensionId}`);
    await use(extensionId);
    console.log('End extensionId fixture');
  },
  page: async ({ page, extensionId }, use) => {
    console.log('Start page fixture');
    await page.goto('/');
    // Required because a new tab is created after install the extension
    await page.bringToFront();
    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');
    await use(page);
    console.log('End page fixture');
  },
  popup: async ({ context, page, worker, extensionId }, use) => {
    console.log('Start popup fixture');

    // Hack: This code let use control the sidel panel open/close
    const manifestPage = await context.newPage();
    await manifestPage.goto(`chrome-extension://${extensionId}/manifest.json`);
    await manifestPage.evaluate(async () => {
      await chrome.runtime.sendMessage({
        type: 'open-side-panel',
      });
    });

    await page.bringToFront();
    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');
    let popupPage: Page | undefined = undefined;
    await waitFor(
      async () => {
        popupPage = page
          .context()
          .pages()
          .find((value) =>
            value.url().match(
              // eslint-disable-next-line no-useless-escape
              new RegExp(`^chrome-extension:\/\/${extensionId}.*popup.html$`),
            ),
          );
        await expect(popupPage).toBeDefined();
      },
      500,
      1000,
    );
    // eslint-disable-next-line playwright/no-networkidle
    await popupPage.waitForLoadState('networkidle');
    await use(popupPage);
    console.log('End popup fixture');
  },
});
export const expect = test.expect;
