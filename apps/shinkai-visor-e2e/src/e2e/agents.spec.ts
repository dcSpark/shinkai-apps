import { FrameLocator } from '@playwright/test';

import { expect, test } from '../fixtures/base';
import { NodeManager } from '../utils/node-manager';
import { acceptTerms } from './welcome.spec';

export const agentTests = () => {
  const nodeManager = new NodeManager(
    '/Users/agallardol/Documents/github/shinkai-node/target/debug/shinkai_node',
  );
  let popupIframe: FrameLocator;

  const addAgent = async (
    popupIframe: FrameLocator,
    agent: {
      agentName: string;
      externalUrl: string;
      apiKey: string;
      model: string;
      models: string;
    },
  ): Promise<void> => {
    await popupIframe.getByTestId('nav-menu-button').click();
    await popupIframe.getByTestId('nav-menu-add-agent-button').click();
    const agentName = popupIframe.getByLabel('Agent name');
    const externalUrl = popupIframe.getByLabel('External url');
    const apiKey = popupIframe.getByLabel('API Key');
    const model = popupIframe
      .getByLabel('Model', { exact: true })
      .locator('..')
      .locator('select');
    const models = popupIframe
      .getByLabel('Models', { exact: true })
      .locator('..')
      .locator('select');

    await agentName.fill(agent.agentName);
    await externalUrl.fill('https://api.openai.com');
    await apiKey.fill('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');
    await model.selectOption('open-ai');
    await models.selectOption('gpt-4-1106-preview');
    await popupIframe.getByTestId('add-agent-submit-button').click();
  };

  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }, testInfo) => {
    await nodeManager.startNode(true);
    await page.goto('/');
    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#popup-iframe');
    const actionButton = page.getByTestId('action-button');
    actionButton.click();

    popupIframe = page.frameLocator('#popup-iframe');
    await expect(popupIframe).toBeDefined();

    await acceptTerms(popupIframe);

    const quickConnectButton = popupIframe.getByTestId('quick-connect-button');
    await quickConnectButton.click();
    await expect(popupIframe.getByTestId('nav-menu-button')).toBeVisible();
  });

  test('agents list should be empty when node is pristine', async ({
    page,
  }) => {
    await popupIframe.getByTestId('nav-menu-button').click();
    await popupIframe.getByTestId('nav-menu-agents-button').click();
    const emptyAgents = popupIframe.getByTestId('empty-agents');
    await expect(emptyAgents).toBeAttached();
  });

  test('add agent fail when form is invalid', async ({ page }) => {
    await popupIframe.getByTestId('nav-menu-button').click();
    await popupIframe.getByTestId('nav-menu-add-agent-button').click();
    const agentName = popupIframe.getByLabel('Agent name');
    await agentName.fill('');
    await popupIframe.getByTestId('add-agent-submit-button').click();
    const errorMessage = agentName.locator('..').locator('p').last();
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveClass(/text-red/);
  });

  test('add agent send user to create job form with new agent pre selected', async ({
    page,
  }) => {
    const agent = {
      agentName: `test_gpt4_turbo_${Date.now()}`,
      externalUrl: 'https://api.openai.com',
      apiKey: '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',
      model: 'open-ai',
      models: 'gpt-4-1106-preview',
    };
    await addAgent(popupIframe, agent);
    const agentInput = popupIframe
      .getByLabel('Agent')
      .locator('..')
      .locator('select');
    await expect(agentInput).toHaveValue(agent.agentName);
  });

  test('new added agent appears on agents list', async ({ page }) => {
    const agent = {
      agentName: `test_gpt4_turbo_${Date.now()}`,
      externalUrl: 'https://api.openai.com',
      apiKey: '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',
      model: 'open-ai',
      models: 'gpt-4-1106-preview',
    };
    await addAgent(popupIframe, agent);

    // It's just to await agent created
    const agentInput = popupIframe
      .getByLabel('Agent')
      .locator('..')
      .locator('select');
    await expect(agentInput).toHaveValue(agent.agentName);

    await popupIframe.getByTestId('nav-menu-button').click();
    await popupIframe.getByTestId('nav-menu-agents-button').click();
    await expect(
      popupIframe.getByTestId(`${agent.agentName}-agent-button`),
    ).toBeVisible();
  });

  test.afterEach(async ({ page }, testInfo) => {
    await nodeManager.stopNode();
  });
};
