import { expect, test } from '../fixtures/base';
import {
  acceptTerms,
  addAgent,
  navigateToMenu,
  quickConnect,
} from '../utils/basic-actions';
import { getAgent } from '../utils/dummy-data';
import { hasError } from '../utils/input-errors';
import { NodeManager } from '../utils/node-manager';

export const jobsTests = () => {
  const nodeManager = new NodeManager();

  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ popup }) => {
    await nodeManager.startNode(true);
    await acceptTerms(popup);
    await quickConnect(popup);
    const agent = getAgent();
    await addAgent(popup, agent);
    const agentInput = popup
      .getByLabel('Agent')
      .locator('..')
      .locator('select');
    await expect(agentInput).toHaveValue(agent.agentName);
  });

  test.afterEach(async () => {
    await nodeManager.stopNode();
  });

  // eslint-disable-next-line playwright/expect-expect
  test('create job fail when form is invalid', async ({ popup }) => {
    await navigateToMenu(popup, 'nav-menu-create-job-button');
    console.log('after nav menu');
    const messageInput = popup.getByLabel('Message');
    await messageInput.fill('');
    await popup.getByTestId('create-job-submit-button').click();
    await hasError(messageInput);
  });

  test('create job redirect to inbox and contains messages', async ({
    popup,
  }) => {
    await navigateToMenu(popup, 'nav-menu-create-job-button');
    const messageInput = popup.getByLabel('Message');
    await messageInput.fill('is this AI agent working?');
    await popup.getByTestId('create-job-submit-button').click();
    const localMessage = popup.getByTestId(/message-local-.*/);
    const remoteMessage = popup.getByTestId(/message-remote-.*/);
    await expect(localMessage).toBeVisible({ timeout: 10000 });
    await expect(remoteMessage).toBeVisible({ timeout: 30000 });
  });
};
