import { Locator } from '@playwright/test';

import { expect } from '../fixtures/base';

export const hasError = async (input: Locator): Promise<void> => {
  const errorMessage = input.locator('..').locator('p').last();
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toHaveClass(/text-red/);
};
