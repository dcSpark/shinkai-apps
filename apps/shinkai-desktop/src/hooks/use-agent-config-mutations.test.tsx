import {
  createAgent,
  updateAgent,
} from '@shinkai_network/shinkai-message-ts/api/agents/index';
import { type Agent } from '@shinkai_network/shinkai-message-ts/api/agents/types';
import { type JobConfig } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { FunctionKeyV2 } from '@shinkai_network/shinkai-node-state/v2/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useCreateAgent, useUpdateAgent } from './use-agent-config-mutations';

vi.mock('@shinkai_network/shinkai-message-ts/api/agents/index', () => ({
  createAgent: vi.fn(async (_address, _token, agent) => agent),
  updateAgent: vi.fn(async (_address, _token, agent) => agent),
}));
const auth = { nodeAddress: 'http://node', token: 'test' };
const cases = [
  ...(['low', 'medium', 'high'] as const).map((effort) => ({
    name: `Haiku off with ${effort}`,
    model: 'claude:claude-haiku-5-5',
    thinking: false,
    effort,
    expectedThinking: false,
    expectedEffort: effort,
  })),
  ...(['xhigh', 'max'] as const).map((effort) => ({
    name: `invalid saved Haiku off ${effort}`,
    model: 'claude:claude-haiku-5-5',
    thinking: false,
    effort,
    expectedThinking: false,
    expectedEffort: 'medium' as const,
  })),

  {
    name: 'untouched Claude default',
    model: 'claude:claude-sonnet-5-5',
    thinking: true,
    effort: undefined,
    expectedThinking: true,
    expectedEffort: 'high',
  },
  {
    name: 'required Claude with saved thinking off',
    model: 'claude:claude-fable-5-1',
    thinking: false,
    effort: 'xhigh',
    expectedThinking: true,
    expectedEffort: 'xhigh',
  },
  {
    name: 'untouched Kimi default',
    model: 'togetherai:moonshotai/Kimi-K3',
    thinking: true,
    effort: undefined,
    expectedThinking: true,
    expectedEffort: 'max',
  },
  {
    name: 'saved Kimi Medium choice',
    model: 'togetherai:moonshotai/Kimi-K3',
    thinking: true,
    effort: 'medium',
    expectedThinking: true,
    expectedEffort: 'high',
  },
  {
    name: 'optional Luna off',
    model: 'openai:gpt-6-luna',
    thinking: false,
    effort: 'high',
    expectedThinking: false,
    expectedEffort: undefined,
  },
  {
    name: 'unknown custom model',
    model: 'openai:custom-model',
    thinking: false,
    effort: 'max',
    expectedThinking: false,
    expectedEffort: 'max',
  },
] as const;

describe.each(['create', 'update'] as const)('agent %s API config', (mode) => {
  it.each(cases)(
    'submits $name without changing raw form values',
    async (testCase) => {
      const client = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      });
      client.setQueryData(
        [FunctionKeyV2.GET_LLM_PROVIDERS, auth],
        [{ id: 'selected', model: testCase.model }],
      );
      const wrapper = ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
      const config: JobConfig = {
        custom_prompt: 'Keep prompt',
        custom_system_prompt: 'Keep system',
        temperature: 0.4,
        top_p: 0.7,
        stream: false,
        use_tools: true,
        other_model_params: { custom: 'keep' },
        thinking: testCase.thinking,
        reasoning_effort: testCase.effort,
      };
      const agent: Agent = {
        name: 'Agent',
        agent_id: 'agent',
        full_identity_name: '@@test/main/agent/agent',
        llm_provider_id: 'selected',
        ui_description: 'Keep description',
        knowledge: ['file'],
        storage_path: '',
        tools: ['tool'],
        tools_config_override: {},
        debug_mode: false,
        config,
      };
      const { result } = renderHook(
        () => ({ create: useCreateAgent(), update: useUpdateAgent() }),
        { wrapper },
      );
      const request = mode === 'create' ? createAgent : updateAgent;
      vi.mocked(request).mockClear();
      await act(async () => {
        await result.current[mode].mutateAsync({ ...auth, agent });
      });
      expect(request).toHaveBeenLastCalledWith(auth.nodeAddress, auth.token, {
        ...agent,
        config: {
          ...config,
          thinking: testCase.expectedThinking,
          reasoning_effort: testCase.expectedEffort,
        },
      });
      expect(agent.config).toBe(config);
      expect(config.reasoning_effort).toBe(testCase.effort);
      expect(config.thinking).toBe(testCase.thinking);
    },
  );
});
