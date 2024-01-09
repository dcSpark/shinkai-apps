import { expect, test } from '../fixtures/base';
import { togglePopup } from '../utils/basic-actions';
export const popupTests = () => {
  test.beforeEach(async ({ page }) => {});
  test('popup should be initially hidden', async ({ popup }) => {
    const popupContent = popup.getByTestId('popup');
    await expect(popupContent).toBeHidden();
  });

  test('popup appear after press action button', async ({
    actionButton,
    popup,
  }) => {
    await togglePopup(actionButton, popup);
    const popupContent = popup.getByTestId('popup');
    await expect(popupContent).toBeVisible();
  });
};
