import {
  Models,
  modelsConfig,
} from '@shinkai_network/shinkai-node-state/lib/utils/models';
import { describe, expect, it, vi } from 'vitest';

import { MODELS_WITH_THINKING_SUPPORT } from '../../../utils/constants';
import { nonOllamaProviderModels } from './ai-update-selection-action-bar';

vi.mock('../conversation-footer', () => ({ actionButtonClassnames: '' }));

describe('current Together model catalog', () => {
  it('keeps current descriptions, presets, and thinking metadata aligned', () => {
    const prefix = 'togetherai:';
    const described = Object.keys(nonOllamaProviderModels)
      .filter((id) => id.startsWith(prefix))
      .sort();
    const thinking = Object.keys(MODELS_WITH_THINKING_SUPPORT)
      .filter((id) => id.startsWith(prefix))
      .sort();
    expect(described).toEqual(thinking);
    const selectable = modelsConfig[Models.TogetherComputer].modelTypes.map(
      (entry) => `${prefix}${entry.value}`,
    );
    for (const id of described) expect(selectable).toContain(id);
    expect(described).toContain('togetherai:deepseek-ai/DeepSeek-V4-Pro-0813');
    expect(described).toContain(
      'togetherai:deepseek-ai/DeepSeek-V4.1-Flash-1017',
    );
  });
});
