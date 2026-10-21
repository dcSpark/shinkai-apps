import { FunctionKeyV2 } from '@shinkai_network/shinkai-node-state/v2/constants';
import { type GetChatConfigOutput } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConfig/types';
import { useGetChatConfig } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConfig/useGetChatConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';

import {
  getThinkingConfig,
  normalizeReasoningEffort,
} from '../utils/thinking-config';

const input = {
  nodeAddress: 'http://node',
  token: 'test-token',
  jobId: 'saved-job',
};

const setup = (apiConfig: GetChatConfigOutput) => {
  const client = new QueryClient();
  client.setQueryData([FunctionKeyV2.GET_CHAT_CONFIG, input], apiConfig);
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useGetChatConfig(input, { enabled: false }), {
    wrapper,
  });
};

describe('saved chat config query', () => {
  it('preserves an omitted reasoning effort so Kimi can use its Max default', () => {
    const apiConfig = { custom_prompt: 'Saved prompt' };
    const { result } = setup(apiConfig);

    expect(result.current.data).toEqual({
      custom_prompt: 'Saved prompt',
      temperature: 0.8,
      seed: -1,
      top_k: 40,
      top_p: 0.9,
      stream: true,
      use_tools: true,
      thinking: true,
      reasoning_effort: undefined,
      web_search_enabled: true,
    });
    expect(
      normalizeReasoningEffort(
        getThinkingConfig('togetherai:moonshotai/Kimi-K3'),
        result.current.data?.reasoning_effort,
      ),
    ).toBe('max');
    expect(apiConfig).not.toHaveProperty('reasoning_effort');
  });

  it('retains an explicit Medium value so Kimi can apply its High alias', () => {
    const { result } = setup({ custom_prompt: '', reasoning_effort: 'medium' });

    expect(result.current.data?.reasoning_effort).toBe('medium');
    expect(
      normalizeReasoningEffort(
        getThinkingConfig('togetherai:moonshotai/Kimi-K3'),
        result.current.data?.reasoning_effort,
      ),
    ).toBe('high');
  });

  it('retains explicit zero and false settings instead of replacing them with defaults', () => {
    const apiConfig = {
      custom_prompt: '',
      temperature: 0,
      seed: 0,
      top_k: 0,
      top_p: 0,
      stream: false,
      use_tools: false,
      thinking: false,
      web_search_enabled: false,
    };
    const { result } = setup(apiConfig);

    expect(result.current.data).toEqual({
      ...apiConfig,
      reasoning_effort: undefined,
    });
  });
});
