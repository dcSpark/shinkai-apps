import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
  cleanup,
} from '@testing-library/react';
import { type UseFormReturn, type useForm } from 'react-hook-form';
import {
  afterAll,
  beforeAll,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  UpdateChatConfigActionBarBase,
  type ChatConfigFormSchemaType,
} from './chat-config-action-bar';

const state = vi.hoisted(() => ({
  model: 'openai:gpt-6-astra',
  thinking: false as boolean | undefined,
  update: vi.fn().mockResolvedValue({}),
  form: undefined as unknown,
}));
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
vi.mock(
  '@shinkai_network/shinkai-node-state/v2/queries/getChatConfig/useGetChatConfig',
  () => ({ useGetChatConfig: () => ({ data: config }) }),
);
vi.mock(
  '@shinkai_network/shinkai-node-state/v2/queries/getProviderFromJob/useGetProviderFromJob',
  () => ({
    useGetProviderFromJob: () => ({
      data: { agent: { id: 'model', model: state.model } },
    }),
  }),
);
vi.mock('../../../hooks/use-chat-config-mutations', () => ({
  useUpdateChatConfig: () => ({ mutateAsync: state.update }),
}));
vi.mock('../../../store/auth', () => ({
  useAuth: () => ({ node_address: 'http://node', api_v2_key: 'test' }),
}));
vi.mock('../../../store/settings', () => ({ useSettings: () => false }));
vi.mock('../conversation-footer', () => ({ actionButtonClassnames: '' }));

const config = {
  stream: true,
  use_tools: true,
  temperature: 0.8,
  top_p: 0.9,
  top_k: 40,
  custom_prompt: '',
  reasoning_effort: 'high',
  get thinking() {
    return state.thinking;
  },
};
beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterAll(() => vi.unstubAllGlobals());
afterEach(() => {
  cleanup();
  state.update.mockClear();
});

describe('saved chat config form submission', () => {
  it.each([false, undefined])(
    'keeps the selected effort on a mandatory model with saved thinking %s',
    async (thinking) => {
      state.model = 'openai:gpt-6-astra';
      state.thinking = thinking;
      const { container } = render(
        <UpdateChatConfigActionBarBase inboxId="job_inbox::job::false" />,
      );
      fireEvent.click(screen.getAllByRole('button')[0]);
      await screen.findByText('Reasoning Effort');
      const form = state.form as UseFormReturn<ChatConfigFormSchemaType>;
      // Reproduce stale form state after an external reset while the forced menu stays visible.
      act(() => {
        form.setValue('thinking', false);
        form.setValue('reasoningEffort', 'xhigh');
      });
      fireEvent.submit(document.querySelector('form') ?? container);
      await waitFor(() => expect(state.update).toHaveBeenCalledOnce());
      expect(state.update.mock.calls[0][0].jobConfig).toMatchObject({
        thinking: true,
        reasoning_effort: 'xhigh',
      });
    },
  );

  it('omits effort when an optional model is off', async () => {
    state.model = 'openai:gpt-6-luna';
    state.thinking = false;
    render(<UpdateChatConfigActionBarBase inboxId="job_inbox::job::false" />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    const save = await screen.findByText('common.save');
    fireEvent.submit(save.closest('form')!);
    await waitFor(() => expect(state.update).toHaveBeenCalledOnce());
    expect(state.update.mock.calls[0][0].jobConfig).toMatchObject({
      thinking: false,
      reasoning_effort: undefined,
    });
  });
});
