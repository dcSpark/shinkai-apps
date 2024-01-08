import { FrameLocator } from '@playwright/test';

import { expect, test } from '../fixtures/base';
import { NodeManager } from '../utils/node-manager';

const nodeManager = new NodeManager(
  '/Users/agallardol/Documents/github/shinkai-node/target/debug/shinkai_node',
);
let popupIframe: FrameLocator;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ page }, testInfo) => {
  await nodeManager.startNode(true);
});

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

  const quickConnectButton = popupIframe.getByTestId('quick-connect-button');
  quickConnectButton.click();
});

test('agents list should be empty when node is pristine', async ({ page }) => {
  await popupIframe.getByTestId('nav-menu-button').click();
  await popupIframe.getByTestId('nav-menu-agents-button').click();
  const emptyAgents = popupIframe.getByTestId(
    'empty-agents',
  );
  await expect(emptyAgents).toBeAttached();
});

test('add agent fail when form is invalid', async ({ page }) => {
  await popupIframe.getByTestId('nav-menu-button').click();
  await popupIframe.getByTestId('nav-menu-add-agent-button').click();
  const agentName = popupIframe.getByLabel('Agent name');
  await agentName.fill('');
  await popupIframe.getByTestId('add-agent-submit-button').click();
  const errorMessage = popupIframe.getByTestId('form-field-error-message');
  await expect(errorMessage).toBeVisible();
});


test.afterAll(async ({ page }, testInfo) => {
  await nodeManager.stopNode();
});
