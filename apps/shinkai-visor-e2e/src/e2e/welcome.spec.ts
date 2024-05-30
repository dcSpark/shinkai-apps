import { expect, test } from '../fixtures/base';
import { acceptTerms } from '../utils/basic-actions';

export const welcomeTests = () => {
  test('welcome should be the first page', async ({ popup }) => {
    const tosLink = popup.getByTestId('terms-of-service-link');
    const ppLink = popup.getByTestId('privacy-policy-link');

    await expect(tosLink).toBeVisible();
    await expect(tosLink).toHaveAttribute(
      'href',
      'https://www.shinkai.com/terms-of-service',
    );
    await expect(ppLink).toBeVisible();
    await expect(ppLink).toHaveAttribute(
      'href',
      'https://www.shinkai.com/privacy-policy',
    );
  });

  test('terms button should start unchecked', async ({ popup }) => {
    const termsInput = popup.getByTestId('terms');
    await expect(termsInput).toHaveAttribute('data-state', 'unchecked');
  });

  test('terms button start should be able to change', async ({ popup }) => {
    const termsInput = popup.getByTestId('terms');
    await expect(termsInput).toHaveAttribute('data-state', 'unchecked');
    await termsInput.click();
    await expect(termsInput).toHaveAttribute('data-state', 'checked');
  });

  test('get started button start disabled', async ({ popup }) => {
    const getStartedButton = popup.getByTestId('get-started-button');
    await expect(getStartedButton).toHaveAttribute('disabled');
  });

  test('get started button should be enabled when terms are accepted', async ({
    popup,
  }) => {
    const termsInput = popup.getByTestId('terms');
    await termsInput.click();

    const getStartedButton = popup.getByTestId('get-started-button');
    await expect(getStartedButton).not.toHaveAttribute('disabled');
  });

  test('navigate to login after terms accepted', async ({ popup }) => {
    await acceptTerms(popup);
    await expect(popup.getByTestId('quick-connect-button')).toBeVisible();
  });
};
