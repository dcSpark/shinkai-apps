import { expect, test } from '../fixtures/base';
import { acceptTerms, quickConnect } from '../utils/basic-actions';
import { NodeManager } from '../utils/node-manager';

export const connectMethodQuickStartTests = () => {
  const nodeManager = new NodeManager();

  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ popup }) => {
    await acceptTerms(popup);
  });

  test.afterEach(async () => {
    await nodeManager.stopNode();
  });

  test('error appear if node is not running', async ({ popup }) => {
    const quickConnectButton = popup.getByTestId('quick-connect-button');
    await quickConnectButton.click();
    const quickConnectErrorMessage = popup.getByTestId(
      'quick-connect-error-message',
    );
    await expect(quickConnectErrorMessage).toBeVisible();
  });

  test('should connect if node is pristine', async ({ popup }) => {
    await nodeManager.startNode(true);
    await quickConnect(popup);
    const emptyAgents = popup.getByTestId('empty-agents');
    await expect(emptyAgents).toBeAttached();
  });

  // eslint-disable-next-line playwright/no-skipped-test
  test.skip('should fail if node is not pristine', async ({ popup }) => {
    // It assumes previous test connected to the node so it's not pristine
    await nodeManager.startNode(false);
    const quickConnectButton = popup.getByTestId('quick-connect-button');
    quickConnectButton.click();
    const quickConnectErrorMessage = popup.getByTestId(
      'quick-connect-error-message',
    );
    await expect(quickConnectErrorMessage).toBeVisible();
  });
};
