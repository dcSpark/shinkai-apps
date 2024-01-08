import { FrameLocator } from '@playwright/test';

import { expect, test } from '../fixtures/base';
import { NodeManager } from "../utils/node-manager";

const nodeManager = new NodeManager('/Users/agallardol/Documents/github/shinkai-node/target/debug/shinkai_node');
let popupIframe: FrameLocator;

test.beforeAll(async ({ page }, testInfo) => {
  await nodeManager.startNode();
});

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('/');
  // eslint-disable-next-line playwright/no-networkidle
  await page.waitForLoadState('networkidle');
  
  const actionButton = page.getByTestId('action-button');
  await expect(actionButton).toBeVisible();

  popupIframe = page.frameLocator('#popup-iframe');
  await expect(popupIframe).toBeDefined();
});

test('can quick connect', async ({ page }) => {

});

test.afterAll(async ({ page }, testInfo) => {
  await nodeManager.stopNode();
});
