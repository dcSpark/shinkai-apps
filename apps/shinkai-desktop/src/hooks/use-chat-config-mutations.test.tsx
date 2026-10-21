import { FunctionKeyV2 } from '@shinkai_network/shinkai-node-state/v2/constants';
import { createJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/index';
import { updateChatConfig } from '@shinkai_network/shinkai-node-state/v2/mutations/updateChatConfig/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useCreateJob, useUpdateChatConfig } from './use-chat-config-mutations';

vi.mock(
  '@shinkai_network/shinkai-node-state/v2/mutations/createJob/index',
  () => ({
    createJob: vi.fn().mockResolvedValue({ jobId: 'new-job' }),
  }),
);
vi.mock(
  '@shinkai_network/shinkai-node-state/v2/mutations/updateChatConfig/index',
  () => ({
    updateChatConfig: vi.fn().mockResolvedValue({}),
  }),
);

const auth = { nodeAddress: 'http://node', token: 'test-token' };
const setup = () => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  client.setQueryData(
    [FunctionKeyV2.GET_LLM_PROVIDERS, auth],
    [{ id: 'kimi', model: 'togetherai:moonshotai/Kimi-K3' }],
  );
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
};

describe('chat mutation boundaries', () => {
  it('sends the normalized new chat config to the API', async () => {
    const { wrapper } = setup();
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCreateJob({ onSuccess }), {
      wrapper,
    });
    await act(async () => {
      await result.current.mutateAsync({
        ...auth,
        llmProvider: 'kimi',
        content: 'Hello',
        isHidden: false,
        chatConfig: { stream: true, thinking: true },
      });
    });
    expect(createJob).toHaveBeenLastCalledWith(
      expect.objectContaining({
        chatConfig: { stream: true, thinking: true, reasoning_effort: 'max' },
      }),
    );
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('uses the new selection at the update API boundary and strips local metadata', async () => {
    const { client, wrapper } = setup();
    client.setQueryData(
      [FunctionKeyV2.GET_PROVIDER_FROM_JOB, { ...auth, jobId: 'job' }],
      { agent: { model: 'openai:gpt-5.2' } },
    );
    const { result } = renderHook(() => useUpdateChatConfig(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        ...auth,
        jobId: 'job',
        selectedProviderId: 'kimi',
        jobConfig: { thinking: true },
      });
    });
    expect(updateChatConfig).toHaveBeenLastCalledWith({
      ...auth,
      jobId: 'job',
      jobConfig: { thinking: true, reasoning_effort: 'max' },
    });
  });
});
