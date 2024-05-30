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

export const agentTests = () => {
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

  test('agents list should be empty when node is pristine', async ({
    popup,
  }) => {
    await navigateToMenu(popup, 'nav-menu-agents-button');
    const emptyAgents = popup.getByTestId('empty-agents');
    await expect(emptyAgents).toBeAttached();
  });

  // eslint-disable-next-line playwright/expect-expect
  test('add agent fail when form is invalid', async ({ popup }) => {
    await navigateToMenu(popup, 'nav-menu-add-agent-button');
    const agentName = popup.getByLabel('Agent name');
    await agentName.fill('');
    await popup.getByTestId('add-agent-submit-button').click();
    await hasError(agentName);
  });

  test('add agent send user to create job form with new agent pre selected', async ({
    popup,
  }) => {
    const agent = getAgent();
    await addAgent(popup, agent);
    const agentInput = popup
      .getByLabel('Agent')
      .locator('..')
      .locator('select');
    await expect(agentInput).toHaveValue(agent.agentName);
  });

  test('new added agent appears on agents list', async ({ popup }) => {
    const agent = getAgent();
    await addAgent(popup, agent);

    // It's just to await agent created
    const agentInput = popup
      .getByLabel('Agent')
      .locator('..')
      .locator('select');
    await expect(agentInput).toHaveValue(agent.agentName);

    await navigateToMenu(popup, 'nav-menu-agents-button');
    await expect(
      popup.getByTestId(`${agent.agentName}-agent-button`),
    ).toBeVisible();
  });
};
