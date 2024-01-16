import * as path from 'path';

import { expect, test } from '../fixtures/base';
import {
  acceptTerms,
  addAgent,
  navigateToMenu,
  quickConnect,
  togglePopup,
} from '../utils/basic-actions';
import { getAgent } from '../utils/dummy-data';
import { NodeManager } from '../utils/node-manager';

export const storageTests = () => {
  const nodeManager = new NodeManager(
    path.join(__filename, '../../shinkai-node/shinkai_node'),
  );

  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ actionButton, popup }) => {
    await nodeManager.startNode(true);
    await togglePopup(actionButton, popup);
    await acceptTerms(popup);
    await quickConnect(popup);
  });

  test.afterEach(async () => {
    await nodeManager.stopNode();
  });

  test('data should persist after refresh browser', async ({ actionButton, popup, page }) => {
    const agent = getAgent();
    await addAgent(popup, agent);

    await navigateToMenu(popup, 'nav-menu-agents-button');
    await expect(
      popup.getByTestId(`${agent.agentName}-agent-button`),
    ).toBeVisible();

    await page.reload({ waitUntil: 'networkidle' });
    await togglePopup(actionButton, popup);
    await navigateToMenu(popup, 'nav-menu-agents-button');
    await expect(
      popup.getByTestId(`${agent.agentName}-agent-button`),
    ).toBeVisible();
  });

  test('data should persist after open a new tab', async ({ actionButton, popup, page, context }) => {
    const agent = getAgent();
    await addAgent(popup, agent);

    await navigateToMenu(popup, 'nav-menu-agents-button');
    await expect(
      popup.getByTestId(`${agent.agentName}-agent-button`),
    ).toBeVisible();
    const newPage = await context.newPage();
    await newPage.goto('https://shinkai.com');
    // eslint-disable-next-line playwright/no-networkidle
    await newPage.waitForLoadState('networkidle');
    const newPageActionButton = newPage.getByTestId('action-button');
    await expect(newPageActionButton).toBeDefined();
    const newPagePopupIframe = newPage.frameLocator('#popup-iframe');
    await expect(newPagePopupIframe).toBeDefined();
    await togglePopup(newPageActionButton, newPagePopupIframe);
    await navigateToMenu(newPagePopupIframe, 'nav-menu-agents-button');
    await expect(
      newPagePopupIframe.getByTestId(`${agent.agentName}-agent-button`),
    ).toBeVisible();
  });
};
