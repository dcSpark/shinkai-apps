import { expect, test } from '../fixtures/base';
import {
  acceptTerms,
  addAgent,
  navigateToMenu,
  quickConnect,
} from '../utils/basic-actions';
import { getAgent } from '../utils/dummy-data';
import { NodeManager } from '../utils/node-manager';

export const storageTests = () => {
  const nodeManager = new NodeManager();

  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ popup }) => {
    await nodeManager.startNode(true);
    await acceptTerms(popup);
    await quickConnect(popup);
  });

  test.afterEach(async () => {
    await nodeManager.stopNode();
  });

  test('data should persist after refresh browser', async ({ popup, page }) => {
    const agent = getAgent();
    await addAgent(popup, agent);

    await navigateToMenu(popup, 'nav-menu-agents-button');
    await expect(
      popup.getByTestId(`${agent.agentName}-agent-button`),
    ).toBeVisible();

    await page.reload({ waitUntil: 'networkidle' });
    await navigateToMenu(popup, 'nav-menu-agents-button');
    await expect(
      popup.getByTestId(`${agent.agentName}-agent-button`),
    ).toBeVisible();
  });

  test('data should persist after open a new tab', async ({
    popup,
    context,
  }) => {
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

    await navigateToMenu(popup, 'nav-menu-agents-button');
    await expect(
      popup.getByTestId(`${agent.agentName}-agent-button`),
    ).toBeVisible();
  });
};
