import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  Button,
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { SubpageLayout } from './layout/simple-layout';

const createTaskFormSchema = z.object({
  name: z.string(),
  cronExpression: z.string(),
  jobConfig: z.object({
    custom_system_prompt: z.string().optional(),
    custom_prompt: z.string().optional(),
    temperature: z.number().optional(),
    max_tokens: z.number().optional(),
    seed: z.number().optional(),
    top_k: z.number().optional(),
    top_p: z.number().optional(),
    stream: z.boolean().optional(),
    other_model_params: z.unknown().optional(),
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

  const form = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      name: '',
      cronExpression: '',
      jobConfig: {
        custom_system_prompt: '',
        custom_prompt: '',
        temperature: 0.5,
        max_tokens: 100,
        seed: 0,
        top_k: 50,
        top_p: 1,
        stream: false,
        other_model_params: {},
        use_tools: false,
      },
      jobMessage: {
        content: '',
        toolKey: '',
      },
    },
  });

  const submit = async (values: CreateTaskForm) => {
    console.log(values);
  };
  return (
    <SubpageLayout className="max-w-lg" title="Create New Task">
      <p className="text-gray-80 -mt-8 py-3 pb-6 text-center text-sm">
        Schedule recurring tasks at a specified time
      </p>
      <Form {...form}>
        <form
          className="flex flex-col justify-between space-y-6"
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
              name="jobMessage.content"
              render={({ field }) => (
                <TextField
                  autoFocus
                  field={field}
                  helperMessage="e.g. Give me top hacker news stories "
                  label="Task Description"
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
          </div>

          <div className="space-y-4">
            <div className="space-y-6 rounded-lg bg-gray-400 px-4 py-4 pb-7">
              <span className="flex-1 items-center gap-1 truncate py-2 text-left text-xs font-semibold text-gray-50">
                AI Model Configuration
              </span>

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
                                <Label htmlFor="temperature">Temperature</Label>
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
                            sequences. This parameter governs the extent of the
                            generated passage, forestalling too much repetition.
                            Selecting a higher figure yields longer narratives,
                            whereas a smaller figure keeps the text brief.
                          </HoverCardContent>
                        </HoverCard>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
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
