import { FrameLocator, Locator } from "@playwright/test";

import { expect } from '../fixtures/base';

export const togglePopup = async (actionButton: Locator, popupIframe: FrameLocator): Promise<void> => {
  await actionButton.click();
  const popup = popupIframe.getByTestId('popup');
  await expect(popup).toBeVisible();
}

export const acceptTerms = async (popup: FrameLocator): Promise<void> => {
  const termsInput = popup.getByTestId('terms');
  await termsInput.click();
  const getStartedButton = popup.getByTestId('get-started-button');
  await getStartedButton.click();
};

export const quickConnect = async (popup: FrameLocator): Promise<void> => {
  const quickConnectButton = popup.getByTestId('quick-connect-button');
  await quickConnectButton.click();
  await expect(popup.getByTestId('nav-menu-button')).toBeVisible();
};

export const addAgent = async (
  popup: FrameLocator,
  agent: {
    agentName: string;
    externalUrl: string;
    apiKey: string;
    model: string;
    models: string;
  },
): Promise<void> => {
  await popup.getByTestId('nav-menu-button').click();
  await popup.getByTestId('nav-menu-add-agent-button').click();
  const agentName = popup.getByLabel('Agent name');
  const externalUrl = popup.getByLabel('External url');
  const apiKey = popup.getByLabel('API Key');
  const model = popup
    .getByLabel('Model', { exact: true })
    .locator('..')
    .locator('select');
  const models = popup
    .getByLabel('Models', { exact: true })
    .locator('..')
    .locator('select');

  await agentName.fill(agent.agentName);
  await externalUrl.fill('https://api.openai.com');
  await apiKey.fill('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');
  await model.selectOption('open-ai');
  await models.selectOption('gpt-4-1106-preview');
  await popup.getByTestId('add-agent-submit-button').click();
};

export const navigateToMenu = async (popup: FrameLocator, menuTestId: string): Promise<void> => {
  await popup.getByTestId('nav-menu-button').click();
  await popup.getByTestId(menuTestId).click();
}
