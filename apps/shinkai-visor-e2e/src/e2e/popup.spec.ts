import { expect, test } from '../fixtures/base';
export const popupTests = () => {
  test('sidepanel appear after press action button', async ({ popup }) => {
    const popupContent = popup.getByTestId('popup');
    await expect(popupContent).toBeVisible();
  });
};
