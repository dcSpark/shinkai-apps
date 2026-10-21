import {
  createRecurringTask,
  setRecurringTask,
} from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/index';
import { type RecurringTask } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/types';
import { FunctionKeyV2 } from '@shinkai_network/shinkai-node-state/v2/constants';
import { getAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/index';
import { getLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react';
import { type ReactNode } from 'react';
import { type useForm, type UseFormReturn } from 'react-hook-form';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import CronTask from './cron-task';

const state = vi.hoisted(() => ({ form: undefined as unknown }));
vi.mock('react-hook-form', async (importOriginal) => {
  const original = await importOriginal<{ useForm: typeof useForm }>();
  return {
    ...original,
    useForm: (...args: Parameters<typeof original.useForm>) => {
      const form = original.useForm(...args);
      state.form = form;
      return form;
    },
  };
});
vi.mock('@shinkai_network/shinkai-i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@shinkai_network/shinkai-message-ts/api/jobs/index', () => ({
  createJob: vi.fn().mockResolvedValue({ job_id: 'job' }),
}));
vi.mock(
  '@shinkai_network/shinkai-message-ts/api/recurring-tasks/index',
  () => ({
    createRecurringTask: vi.fn().mockResolvedValue({}),
    setRecurringTask: vi.fn().mockResolvedValue({}),
  }),
);
vi.mock(
  '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList',
  () => ({ useGetTools: () => ({ data: [], isSuccess: true }) }),
);
vi.mock(
  '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/index',
  () => ({ getLLMProviders: vi.fn(async () => providers) }),
);
vi.mock(
  '@shinkai_network/shinkai-node-state/v2/queries/getAgents/index',
  () => ({ getAgents: vi.fn(async () => agents) }),
);
vi.mock('react-router', () => ({ useNavigate: () => vi.fn() }));
vi.mock('../../../store/auth', () => ({
  useAuth: () => ({ node_address: 'http://node', api_v2_key: 'test' }),
}));
vi.mock('../../../store/settings', () => ({ useSettings: () => 'claude' }));
vi.mock('../../../pages/layout/simple-layout', () => ({
  SubpageLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('../../chat/conversation-footer', () => ({
  actionButtonClassnames: '',
}));
vi.mock('../../chat/chat-action-bar/ai-update-selection-action-bar', () => ({
  AIModelSelector: () => null,
}));

beforeAll(() =>
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterAll(() => vi.unstubAllGlobals());
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const auth = { nodeAddress: 'http://node', token: 'test' };
const providers = [
  { id: 'claude', model: 'claude:claude-fable-5-1' },
  { id: 'gemini', model: 'gemini:gemini-3.5-flash-lite' },
  { id: 'luna', model: 'openai:gpt-6-luna' },
  { id: 'kimi', model: 'togetherai:moonshotai/Kimi-K3' },
];
const agents = [
  { agent_id: 'gemini-agent', llm_provider_id: 'gemini' },
  { agent_id: 'kimi-agent', llm_provider_id: 'kimi' },
];
const savedConfig = {
  custom_prompt: 'Preserve prompt',
  temperature: 0.7,
  top_p: 0.8,
  top_k: 20,
  stream: true,
  use_tools: false,
};
const initialValues = {
  task_id: 7,
  name: 'Task',
  description: '',
  cron: '0 * * * *',
  paused: false,
  action: {
    CreateJobWithConfigAndMessage: {
      config: savedConfig,
      llm_provider: 'claude',
      message: { job_id: 'job', content: 'Run' },
    },
  },
} as RecurringTask;

const cases = [
  {
    name: 'required provider',
    target: 'claude',
    thinking: false,
    effort: 'xhigh',
    expectedThinking: true,
    expectedEffort: 'xhigh',
  },
  {
    name: 'required agent with model default',
    target: 'gemini-agent',
    thinking: undefined,
    effort: undefined,
    expectedThinking: true,
    expectedEffort: 'minimal',
  },
  {
    name: 'optional provider off',
    target: 'luna',
    thinking: false,
    effort: 'high',
    expectedThinking: false,
    expectedEffort: undefined,
  },
  {
    name: 'optional agent saved effort',
    target: 'kimi-agent',
    thinking: true,
    effort: 'medium',
    expectedThinking: true,
    expectedEffort: 'high',
  },
] as const;

describe.each(['create', 'edit'] as const)(
  'scheduled task %s API requests',
  (mode) => {
    it.each(['network failure', 'missing target', 'filtered target'] as const)(
      'preserves the original API config after %s',
      async (fallback) => {
        const client = new QueryClient({
          defaultOptions: {
            mutations: { retry: false },
            queries: { retry: false },
          },
        });
        const target =
          fallback === 'missing target' ? 'unknown-provider' : 'gemini-agent';
        if (fallback === 'network failure') {
          vi.mocked(getLLMProviders).mockRejectedValueOnce(
            new Error('Model metadata unavailable'),
          );
          vi.mocked(getAgents).mockRejectedValueOnce(
            new Error('Agent metadata unavailable'),
          );
        } else {
          client.setQueryData(
            [FunctionKeyV2.GET_LLM_PROVIDERS, auth],
            fallback === 'filtered target' ? [] : providers,
          );
          client.setQueryData(
            [FunctionKeyV2.GET_AGENTS, auth],
            fallback === 'filtered target' ? [] : agents,
          );
        }
        render(
          <QueryClientProvider client={client}>
            <CronTask
              mode={mode}
              initialValues={mode === 'edit' ? initialValues : undefined}
            />
          </QueryClientProvider>,
        );
        const originalConfig = {
          ...savedConfig,
          thinking: false,
          reasoning_effort: 'xhigh' as const,
        };
        const form = state.form as UseFormReturn;
        act(() => {
          form.setValue('cronExpression', '0 * * * *');
          form.setValue('llmOrAgentId', target);
          form.setValue('jobConfig', originalConfig);
          form.setValue('jobMessage.content', 'Keep scheduled message');
        });
        fireEvent.submit(document.querySelector('form')!);
        const request =
          mode === 'create' ? createRecurringTask : setRecurringTask;
        await waitFor(() => expect(request).toHaveBeenCalledOnce());
        const action = vi.mocked(request).mock.calls[0][2].action;
        expect(action).toMatchObject({
          CreateJobWithConfigAndMessage: {
            llm_provider: target,
            config: originalConfig,
            message: { content: 'Keep scheduled message' },
          },
        });
        expect(action.CreateJobWithConfigAndMessage.config).toEqual(
          originalConfig,
        );
      },
    );

    it.each(cases)('normalizes $name', async (testCase) => {
      const client = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      });
      // Exercise the real fetch fallback for both create and update agent targets.
      if (testCase.target !== 'gemini-agent') {
        client.setQueryData([FunctionKeyV2.GET_LLM_PROVIDERS, auth], providers);
        client.setQueryData([FunctionKeyV2.GET_AGENTS, auth], agents);
      }
      render(
        <QueryClientProvider client={client}>
          <CronTask
            mode={mode}
            initialValues={mode === 'edit' ? initialValues : undefined}
          />
        </QueryClientProvider>,
      );
      const form = state.form as UseFormReturn;
      act(() => {
        form.setValue('cronExpression', '0 * * * *');
        form.setValue('llmOrAgentId', testCase.target);
        form.setValue('jobConfig', {
          ...savedConfig,
          thinking: testCase.thinking,
          reasoning_effort: testCase.effort,
        });
      });
      fireEvent.submit(document.querySelector('form')!);
      const request =
        mode === 'create' ? createRecurringTask : setRecurringTask;
      await waitFor(() => expect(request).toHaveBeenCalledOnce());
      const payload = vi.mocked(request).mock.calls[0][2];
      expect(payload.action).toMatchObject({
        CreateJobWithConfigAndMessage: {
          llm_provider: testCase.target,
          config: {
            ...savedConfig,
            thinking: testCase.expectedThinking,
            reasoning_effort: testCase.expectedEffort,
          },
        },
      });
    });
  },
);
