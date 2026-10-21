import { createRecurringTask as createRecurringTaskApi } from '@shinkai_network/shinkai-message-ts/api/recurring-tasks/index';
import { createRecurringTask } from '@shinkai_network/shinkai-node-state/v2/mutations/createRecurringTask/index';
import { describe, expect, it, vi } from 'vitest';

import { getAgentScheduleConfig } from './agent-schedule-config';

vi.mock('@shinkai_network/shinkai-message-ts/api/jobs/index', () => ({
  createJob: vi.fn().mockResolvedValue({ job_id: 'job' }),
}));
vi.mock(
  '@shinkai_network/shinkai-message-ts/api/recurring-tasks/index',
  () => ({ createRecurringTask: vi.fn().mockResolvedValue({}) }),
);

describe('agent scheduled request config', () => {
  it.each([
    ['claude:claude-fable-5-1', false, undefined, true, 'high'],
    ['gemini:gemini-3.5-flash-lite', false, undefined, true, 'minimal'],
    ['openai:gpt-6-luna', false, 'high', false, undefined],
    ['claude:claude-haiku-5-5', false, 'low', false, 'low'],
    ['claude:claude-haiku-5-5', false, 'max', false, 'medium'],
  ] as const)(
    'normalizes the recurring API config for %s',
    async (model, thinking, effort, expectedThinking, expectedEffort) => {
      const original = {
        custom_prompt: 'Keep prompt',
        thinking,
        reasoning_effort: effort,
        temperature: 0.4,
        top_p: 0.7,
        top_k: 40,
      };
      const chatConfig = getAgentScheduleConfig(original, model, true);
      await createRecurringTask({
        nodeAddress: 'http://node',
        token: 'test',
        name: 'Task',
        description: '',
        llmProvider: 'agent',
        cronExpression: '0 * * * *',
        message: 'Run',
        chatConfig,
      });
      expect(
        vi.mocked(createRecurringTaskApi).mock.lastCall?.[2].action,
      ).toMatchObject({
        CreateJobWithConfigAndMessage: {
          config: {
            ...original,
            thinking: expectedThinking,
            reasoning_effort: expectedEffort,
            use_tools: true,
          },
        },
      });
      expect(original.thinking).toBe(thinking);
      expect(original.reasoning_effort).toBe(effort);
    },
  );
});
