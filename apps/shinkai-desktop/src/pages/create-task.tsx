import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useCreateRecurringTask } from '@shinkai_network/shinkai-node-state/v2/mutations/createRecurringTask/useCreateRecurringTask';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Label,
  Slider,
  Switch,
  Textarea,
  TextField,
} from '@shinkai_network/shinkai-ui';
import {
  ScheduledTasksIcon,
  ToolsIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import cronstrue from 'cronstrue';
import { BotIcon, ChevronDownIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { AIModelSelector } from '../components/chat/chat-action-bar/ai-update-selection-action-bar';
import { actionButtonClassnames } from '../components/chat/conversation-footer';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { SubpageLayout } from './layout/simple-layout';

const createTaskFormSchema = z.object({
  name: z.string(),
  description: z.string(),
  llmOrAgentId: z.string(),
  cronExpression: z.string().refine(
    (value) => {
      try {
        cronstrue.toString(value, {
          throwExceptionOnParseError: true,
        });
        return true;
      } catch (error) {
        return false;
      }
    },
    {
      message:
        'Invalid cron expression. Please provide a valid cron expression.',
    },
  ),
  jobConfig: z.object({
    custom_system_prompt: z.string().optional(),
    custom_prompt: z.string(),
    temperature: z.number(),
    max_tokens: z.number().optional(),
    seed: z.number().optional(),
    top_k: z.number(),
    top_p: z.number(),
    stream: z.boolean().optional(),
    use_tools: z.boolean().optional(),
  }),
  jobMessage: z.object({
    content: z.string(),
    toolKey: z.string().optional(),
  }),
});
type CreateTaskForm = z.infer<typeof createTaskFormSchema>;

function CreateTaskPage() {
  const { t } = useTranslation();
  const defaultAgentId = useSettings((state) => state.defaultAgentId);
  const navigate = useNavigate();
  const auth = useAuth((state) => state.auth);
  const form = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      name: 'Hacker News Task',
      description: 'Hacker News yada yada',
      cronExpression: '* * * * *',
      jobConfig: {
        custom_system_prompt: '',
        custom_prompt: '',
        temperature: 0.5,
        max_tokens: 100,
        seed: 0,
        top_k: 50,
        top_p: 1,
        stream: false,
        use_tools: false,
      },
      llmOrAgentId: defaultAgentId,
      jobMessage: {
        content: 'Search in duckduckgo about top hacker news stories',
        toolKey:
          'local:::shinkai_tool_duckduckgo_search:::shinkai__duckduckgo_search',
      },
    },
  });

  const { data: toolsList, isSuccess: isToolListSuccess } = useGetTools({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { mutateAsync: createRecurringTask } = useCreateRecurringTask({
    onSuccess: () => {
      toast.success('Task created successfully');
      navigate('/tasks');
    },
    onError: (error) => {
      toast.error('Failed to create task', {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  const submit = async (values: CreateTaskForm) => {
    await createRecurringTask({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      cronExpression: values.cronExpression,
      chatConfig: values.jobConfig,
      message: values.jobMessage.content,
      toolRouterKey: values.jobMessage.toolKey,
      llmProvider: values.llmOrAgentId,
      name: values.name,
      description: values.description,
    });
  };

  useEffect(() => {
    if (defaultAgentId) {
      form.setValue('llmOrAgentId', defaultAgentId);
    }
  }, [defaultAgentId]);

  const currentCronExpression = form.watch('cronExpression');

  const readableCronExpression = useMemo(() => {
    const readableCron = cronstrue.toString(currentCronExpression, {
      throwExceptionOnParseError: false,
    });
    if (readableCron.toLowerCase().includes('error')) {
      return null;
    }
    return readableCron;
  }, [currentCronExpression, form]);
  return (
    <SubpageLayout className="max-w-4xl" title="Create Cron Task">
      <p className="text-gray-80 -mt-8 py-3 pb-6 text-center text-sm">
        Schedule recurring tasks at a specified time
      </p>
      <Form {...form}>
        <form
          className="flex grid grid-cols-2 flex-col justify-between gap-8 pt-4"
          onSubmit={form.handleSubmit(submit)}
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <TextField autoFocus field={field} label="Task Name" />
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <TextField autoFocus field={field} label="Task Description" />
              )}
            />
            <FormField
              control={form.control}
              name="jobMessage.content"
              render={({ field }) => (
                <TextField
                  autoFocus
                  field={field}
                  helperMessage="e.g. Give me top hacker news stories "
                  label="Task Prompt"
                />
              )}
            />

            <FormField
              control={form.control}
              name="cronExpression"
              render={({ field }) => (
                <TextField
                  autoFocus
                  field={field}
                  helperMessage="Enter a cron expression eg: */30 * * * * (every 30 min) "
                  label="Cron Expression"
                />
              )}
            />
            {readableCronExpression && (
              <div className="flex items-center gap-2 text-xs">
                <ScheduledTasksIcon className="size-4" />
                <span>
                  This cron will run {readableCronExpression.toLowerCase()}{' '}
                  <span className="text-gray-80 font-mono">
                    ({form.watch('cronExpression')})
                  </span>
                </span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-6 rounded-lg bg-gray-400 px-4 py-4 pb-7">
                <span className="flex-1 items-center gap-1 truncate py-2 text-left text-xs font-semibold text-gray-50">
                  AI Model Configuration
                </span>

                <div className="space-y-4">
                  <div className="grid grid-cols-[1fr_100px] items-center">
                    <span className="text-gray-80 text-xs">
                      Select AI/Agent
                    </span>
                    <AIModelSelector
                      onValueChange={(value) => {
                        form.setValue('llmOrAgentId', value);
                      }}
                      value={form.watch('llmOrAgentId')}
                    />
                  </div>
                  <div className="grid grid-cols-[1fr_250px] items-center">
                    <span className="text-gray-80 text-xs">
                      Select Tool (optional)
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(
                          actionButtonClassnames,
                          'w-auto truncate [&[data-state=open]>.icon]:rotate-180',
                        )}
                      >
                        <ToolsIcon className="mr-1 h-4 w-4" />
                        <span>
                          {form.watch('jobMessage.toolKey')
                            ? formatText(
                                form
                                  .watch('jobMessage.toolKey')
                                  ?.split(':::')?.[2] ?? '',
                              )
                            : 'Select Tool (optional)'}
                        </span>
                        <ChevronDownIcon className="icon h-3 w-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="max-h-[400px] min-w-[330px] overflow-y-auto bg-gray-300 p-1 py-2"
                        side="top"
                      >
                        <DropdownMenuRadioGroup
                          onValueChange={(value) => {
                            form.setValue('jobMessage.toolKey', value);
                          }}
                          value={form.watch('jobMessage.toolKey')}
                        >
                          <DropdownMenuLabel className="mt-2 px-2 py-1">
                            Available Tools
                          </DropdownMenuLabel>
                          {isToolListSuccess &&
                            toolsList.length > 0 &&
                            toolsList?.map((tool) => (
                              <DropdownMenuRadioItem
                                className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-2 text-white transition-colors hover:bg-gray-200 aria-checked:bg-gray-200"
                                key={tool.tool_router_key}
                                value={tool.tool_router_key}
                              >
                                <BotIcon className="h-3.5 w-3.5 shrink-0" />
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs">
                                    {formatText(tool.name)}
                                  </span>
                                </div>
                              </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="jobConfig.custom_system_prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            className="!min-h-[130px] resize-none text-sm"
                            spellCheck={false}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jobConfig.stream"
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col gap-3">
                        <div className="flex gap-3">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="static space-y-1.5 text-sm text-white">
                              Enable Stream
                            </FormLabel>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobConfig.use_tools"
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col gap-3">
                        <div className="flex gap-3">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="static space-y-1.5 text-sm text-white">
                              Enable Tools
                            </FormLabel>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobConfig.temperature"
                    render={({ field }) => (
                      <FormItem className="flex gap-2.5">
                        <FormControl>
                          <HoverCard openDelay={200}>
                            <HoverCardTrigger asChild>
                              <div className="grid w-full gap-4">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="temperature">
                                    Temperature
                                  </Label>
                                  <span className="text-muted-foreground hover:border-border w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm">
                                    {field.value}
                                  </span>
                                </div>
                                <Slider
                                  aria-label="Temperature"
                                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                                  id="temperature"
                                  max={1}
                                  onValueChange={(vals) => {
                                    field.onChange(vals[0]);
                                  }}
                                  step={0.1}
                                  value={[field.value]}
                                />
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent
                              align="start"
                              className="w-[260px] bg-gray-600 px-2 py-3 text-xs"
                              side="left"
                            >
                              Temperature is a parameter that affects the
                              randomness of AI outputs. Higher temp = more
                              unexpected, lower temp = more predictable.
                            </HoverCardContent>
                          </HoverCard>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobConfig.top_p"
                    render={({ field }) => (
                      <FormItem className="flex gap-2.5">
                        <FormControl>
                          <HoverCard openDelay={200}>
                            <HoverCardTrigger asChild>
                              <div className="grid w-full gap-4">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="topP">Top P</Label>
                                  <span className="text-muted-foreground hover:border-border w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm">
                                    {field.value}
                                  </span>
                                </div>
                                <Slider
                                  aria-label="Top P"
                                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                                  id="topP"
                                  max={1}
                                  min={0}
                                  onValueChange={(vals) => {
                                    field.onChange(vals[0]);
                                  }}
                                  step={0.1}
                                  value={[field.value]}
                                />
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent
                              align="start"
                              className="w-[260px] bg-gray-600 px-2 py-3 text-xs"
                              side="left"
                            >
                              Adjust the probability threshold to increase the
                              relevance of results. For example, a threshold of
                              0.9 could be optimal for targeted, specific
                              applications, whereas a threshold of 0.95 or 0.97
                              might be preferred for tasks that require broader,
                              more creative responses.
                            </HoverCardContent>
                          </HoverCard>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobConfig.top_k"
                    render={({ field }) => (
                      <FormItem className="flex gap-2.5">
                        <FormControl>
                          <HoverCard openDelay={200}>
                            <HoverCardTrigger asChild>
                              <div className="grid w-full gap-4">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="topK">Top K</Label>
                                  <span className="text-muted-foreground hover:border-border w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm">
                                    {field.value}
                                  </span>
                                </div>
                                <Slider
                                  aria-label="Top K"
                                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                                  id="topK"
                                  max={100}
                                  onValueChange={(vals) => {
                                    field.onChange(vals[0]);
                                  }}
                                  step={1}
                                  value={[field.value]}
                                />
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent
                              align="start"
                              className="w-[260px] bg-gray-600 px-2 py-3 text-xs"
                              side="left"
                            >
                              Adjust the count of key words for creating
                              sequences. This parameter governs the extent of
                              the generated passage, forestalling too much
                              repetition. Selecting a higher figure yields
                              longer narratives, whereas a smaller figure keeps
                              the text brief.
                            </HoverCardContent>
                          </HoverCard>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2 flex items-center justify-end gap-2">
            <Button
              className="min-w-[120px]"
              // disabled={isPending}
              // onClick={() => navigate('/ais?tab=agents')}
              size="sm"
              type="button"
              variant="outline"
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="min-w-[120px]"
              // disabled={isPending}
              // isLoading={isPending}
              size="sm"
              type="submit"
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Form>
    </SubpageLayout>
  );
}

export default CreateTaskPage;
