import { expect, test } from '../fixtures/base';
import { acceptTerms, addAgent, quickConnect } from '../utils/basic-actions';
import { getAgent } from '../utils/dummy-data';
import { NodeManager } from '../utils/node-manager';

export const extenralCommunicationTests = () => {
  const nodeManager = new NodeManager();

  test.describe.configure({ mode: 'serial' });

  test.afterEach(async () => {
    await nodeManager.stopNode();
  });

  test('any command unauthorized in non allowed origin', async ({
    page,
    extensionId,
  }) => {
    await page.goto('https://google.com');
    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle');
    const response = await page.evaluate(
      async ({ extensionId }) => {
        return chrome.runtime.sendMessage(extensionId, {
          type: 'is-node-pristine',
          payload: {
            nodeAddress: 'http://localhost:9550',
          },
        });
      },
      { extensionId },
    );
    console.log('response', response);
    await expect(response.status).toBe('unauthorized');
  });

  test('is-node-pristine error if node is not running', async ({
    page,
    extensionId,
  }) => {
    const response = await page.evaluate(
      async ({ extensionId }) => {
        return chrome.runtime.sendMessage(extensionId, {
          type: 'is-node-pristine',
          payload: {
            nodeAddress: 'http://localhost:9550',
          },
        });
      },
      { extensionId },
    );
    console.log('response', response);
    await expect(response.status).toBe('error');
  });

  test('is-node-pristine success when node is running and pristine', async ({
    page,
    extensionId,
  }) => {
    await nodeManager.startNode(true);
    const response = await page.evaluate(
      async ({ extensionId }) => {
        return chrome.runtime.sendMessage(extensionId, {
          type: 'is-node-pristine',
          payload: {
            nodeAddress: 'http://localhost:9550',
          },
        });
      },
      { extensionId },
    );
    console.log('response', response);
    await expect(response.status).toBe('success');
    await expect(response.payload.isPristine).toBe(true);
  });

  test('is-node-pristine error when node is not pristine', async ({
    page,
    popup,
    extensionId,
  }) => {
    await nodeManager.startNode(true);
    await acceptTerms(popup);
    await quickConnect(popup);
    const response = await page.evaluate(
      async ({ extensionId }) => {
        return chrome.runtime.sendMessage(extensionId, {
          type: 'is-node-pristine',
          payload: {
            nodeAddress: 'http://localhost:9550',
          },
        });
      },
      { extensionId },
    );
    console.log('response', response);
    await expect(response.status).toBe('success');
    await expect(response.payload.isPristine).toBe(false);
    await nodeManager.stopNode();
  });

  test('quick-connection-intent should open popup and set node address', async ({
    page,
    extensionId,
    popup,
  }) => {
    const nodeAddress = 'http://localhost:3000';
    const response = await page.evaluate(
      async ({ extensionId, nodeAddress }) => {
        return chrome.runtime.sendMessage(extensionId, {
          type: 'quick-connection-intent',
          payload: {
            nodeAddress,
          },
        });
      },
      { extensionId, nodeAddress },
    );
    console.log('response', response);
    const popupContent = popup.getByTestId('popup');
    const nodeAddressInput = popup.getByLabel('Node Address');
    await expect(response.status).toBe('success');
    await expect(popupContent).toBeVisible();
    await expect(nodeAddressInput).toHaveValue(nodeAddress);
  });

  test('get-profile-agents success with length 1 when add node', async ({
    page,
    popup,
    extensionId,
  }) => {
    await nodeManager.startNode(true);
    await acceptTerms(popup);
    await quickConnect(popup);
    await addAgent(popup, getAgent());
    const response = await page.evaluate(
      async ({ extensionId }) => {
        return chrome.runtime.sendMessage(extensionId, {
          type: 'get-profile-agents',
        });
      },
      { extensionId },
    );
    console.log('response', response);
    await expect(response.status).toBe('success');
    await expect(response.payload.agents).toHaveLength(1);
    await nodeManager.stopNode();
  });

  test('get-profile-inboxes success with length 1', async ({
    page,
    popup,
    extensionId,
  }) => {
    await nodeManager.startNode(true);
    await acceptTerms(popup);
    await quickConnect(popup);
    await addAgent(popup, getAgent());
    const messageInput = popup.getByLabel('Message');
    await messageInput.fill('is this real?');
    await popup.getByTestId('create-job-submit-button').click();
    const response = await page.evaluate(
      async ({ extensionId }) => {
        return chrome.runtime.sendMessage(extensionId, {
          type: 'get-profile-inboxes',
        });
      },
      { extensionId },
    );
    console.log('response', response);
    await expect(response.status).toBe('success');
    await expect(response.payload.inboxes).toHaveLength(1);
    await nodeManager.stopNode();
  });

  test('is-installed', async ({
    page,
    extensionId,
  }) => {
    const response = await page.evaluate(
      async ({ extensionId }) => {
        return chrome.runtime.sendMessage(extensionId, {
          type: 'is-installed',
          payload: undefined,
        });
      },
      { extensionId },
    );
    console.log('response', response);
    await expect(response.status).toBe('success');
    await expect(response.payload.isInstalled).toBe(true);
    await expect(response.payload.version).toMatch(/.*\..*\..*\..*/);
  });

  test('is-node-connected', async ({
    page,
    extensionId,
  }) => {
    const response = await page.evaluate(
      async ({ extensionId }) => {
        return chrome.runtime.sendMessage(extensionId, {
          type: 'is-node-connected',
          payload: {
            nodeAddress: 'http://localhost:9550',
          },
        });
      },
      { extensionId },
    );
    console.log('response', response);
    await expect(response.status).toBe('success');
    await expect(response.payload.isNodeConnected).toBe(false);
  });
};
