import { zodResolver } from '@hookform/resolvers/zod';
import { PopoverClose } from '@radix-ui/react-popover';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useUpdateChatConfig } from '@shinkai_network/shinkai-node-state/v2/mutations/updateChatConfig/useUpdateChatConfig';
import { useGetChatConfig } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConfig/useGetChatConfig';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
  Slider,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { Settings2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../../../store/auth';
import { actionButtonClassnames } from '../conversation-footer';

const formSchema = z.object({
  stream: z.boolean(),
  customPrompt: z.string().optional(),
  temperature: z.number(),
  topP: z.number(),
  topK: z.number(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function ChatConfigActionBar() {
  const auth = useAuth((state) => state.auth);
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const { data: chatConfig } = useGetChatConfig(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: inboxId ? extractJobIdFromInbox(inboxId) : '',
    },
    { enabled: !!inboxId },
  );
  const { t } = useTranslation();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stream: chatConfig?.stream,
      customPrompt: chatConfig?.custom_prompt ?? '',
      temperature: chatConfig?.temperature,
      topP: chatConfig?.top_p,
      topK: chatConfig?.top_k,
    },
  });

  const { mutateAsync: updateChatConfig } = useUpdateChatConfig({
    onSuccess: () => {
      toast.success('Chat settings updated successfully');
    },
  });

  useEffect(() => {
    form.reset({
      stream: chatConfig?.stream,
      customPrompt: chatConfig?.custom_prompt ?? '',
      temperature: chatConfig?.temperature,
      topP: chatConfig?.top_p,
      topK: chatConfig?.top_k,
    });
  }, [chatConfig, form]);

  const onSubmit = async (data: FormSchemaType) => {
    await updateChatConfig({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: extractJobIdFromInbox(inboxId),
      jobConfig: {
        stream: data.stream,
        custom_prompt: '',
        temperature: data.temperature,
        top_p: data.topP,
        top_k: data.topK,
      },
    });
  };

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) {
          form.reset({
            stream: chatConfig?.stream,
            customPrompt: chatConfig?.custom_prompt ?? '',
            temperature: chatConfig?.temperature,
            topP: chatConfig?.top_p,
            topK: chatConfig?.top_k,
          });
        }
      }}
    >
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <button className={actionButtonClassnames} type="button">
                <Settings2 className="h-full w-full" />
              </button>
            </TooltipTrigger>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="min-w-[380px] bg-gray-300 px-6 py-7 text-xs"
            side="top"
          >
            <h2 className="leading-1 mb-3 text-xs uppercase text-gray-100">
              Basic Options
            </h2>

            <Form {...form}>
              <form
                className="flex w-full flex-col justify-between gap-10 overflow-hidden"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="stream"
                    render={({ field }) => (
                      <FormItem className="flex gap-2.5">
                        <FormControl>
                          <Switch
                            aria-readonly
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="static space-y-1.5 text-sm text-white">
                            Enable Stream
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="temperature"
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
                                  onValueChange={field.onChange}
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
                    name="topP"
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
                                  onValueChange={field.onChange}
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
                    name="topK"
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
                                  onValueChange={field.onChange}
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
                <div className="flex items-center gap-2">
                  <PopoverClose asChild>
                    <Button
                      className="w-full text-sm"
                      size="sm"
                      variant="outline"
                    >
                      <span>{t('common.cancel')}</span>
                    </Button>
                  </PopoverClose>
                  <PopoverClose asChild>
                    <Button
                      className="w-full text-sm"
                      size="sm"
                      type={'submit'}
                    >
                      <span>{t('common.save')}</span>
                    </Button>
                  </PopoverClose>
                </div>
              </form>
            </Form>
          </PopoverContent>
          <TooltipContent>Chat Settings</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Popover>
  );
}
