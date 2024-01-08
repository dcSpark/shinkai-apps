import { FrameLocator } from '@playwright/test';

import { expect, test } from '../fixtures/base';
import { NodeManager } from '../utils/node-manager';

const nodeManager = new NodeManager(
  '/Users/agallardol/Documents/github/shinkai-node/target/debug/shinkai_node',
);
let popupIframe: FrameLocator;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ page }, testInfo) => {});

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto('/');
  // eslint-disable-next-line playwright/no-networkidle
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('#popup-iframe');
  const actionButton = page.getByTestId('action-button');
  actionButton.click();

  popupIframe = page.frameLocator('#popup-iframe');
  await expect(popupIframe).toBeDefined();

  const termsInput = popupIframe.getByTestId('terms');
  await termsInput.click();

  const getStartedButton = popupIframe.getByTestId('get-started-button');
  await getStartedButton.click();
});

test('error appear if node is not running', async ({ page }) => {
  const quickConnectButton = popupIframe.getByTestId('quick-connect-button');
  quickConnectButton.click();
  const quickConnectErrorMessage = popupIframe.getByTestId(
    'quick-connect-error-message',
  );
  await expect(quickConnectErrorMessage).toBeVisible();
});

test('should connect if node is pristine', async ({ page }) => {
  await nodeManager.startNode(true);
  const quickConnectButton = popupIframe.getByTestId('quick-connect-button');
  console.log('CLICK CONNECT');
  quickConnectButton.click();
  const emptyAgents = popupIframe.getByTestId(
    'empty-agents',
  );
  await expect(emptyAgents).toBeAttached();
  await nodeManager.stopNode();
});

test('should fail if node is not pristine', async ({ page }) => {
  await nodeManager.startNode(false);
  const quickConnectButton = popupIframe.getByTestId('quick-connect-button');
  quickConnectButton.click();
  const quickConnectErrorMessage = popupIframe.getByTestId(
    'quick-connect-error-message',
  );
  await expect(quickConnectErrorMessage).toBeVisible();
  await nodeManager.stopNode();
});

test.afterAll(async ({ page }, testInfo) => {
  await nodeManager.stopNode();
});
