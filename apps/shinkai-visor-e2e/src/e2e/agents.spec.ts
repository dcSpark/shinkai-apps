import { expect, test } from '../fixtures/base';
import {
  acceptTerms,
  addAgent,
  navigateToMenu,
  popupVisible,
  quickConnect,
} from '../utils/basic-actions';
import { NodeManager } from '../utils/node-manager';

export const agentTests = () => {
  const nodeManager = new NodeManager(
    '/Users/agallardol/Documents/github/shinkai-node/target/debug/shinkai_node',
  );

  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ actionButton, popup }) => {
    await nodeManager.startNode(true);
    await popupVisible(actionButton, popup);
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

  test('add agent fail when form is invalid', async ({ popup }) => {
    await navigateToMenu(popup, 'nav-menu-add-agent-button');
    const agentName = popup.getByLabel('Agent name');
    await agentName.fill('');
    await popup.getByTestId('add-agent-submit-button').click();
    const errorMessage = agentName.locator('..').locator('p').last();
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveClass(/text-red/);
  });

  test('add agent send user to create job form with new agent pre selected', async ({
    popup,
  }) => {
    const agent = {
      agentName: `test_gpt4_turbo_${Date.now()}`,
      externalUrl: 'https://api.openai.com',
      apiKey: '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',
      model: 'open-ai',
      models: 'gpt-4-1106-preview',
    };
    await addAgent(popup, agent);
    const agentInput = popup
      .getByLabel('Agent')
      .locator('..')
      .locator('select');
    await expect(agentInput).toHaveValue(agent.agentName);
  });

  test('new added agent appears on agents list', async ({ popup }) => {
    const agent = {
      agentName: `test_gpt4_turbo_${Date.now()}`,
      externalUrl: 'https://api.openai.com',
      apiKey: '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',
      model: 'open-ai',
      models: 'gpt-4-1106-preview',
    };
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
