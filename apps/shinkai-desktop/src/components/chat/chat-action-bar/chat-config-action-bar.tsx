import { zodResolver } from '@hookform/resolvers/zod';
import { PopoverClose } from '@radix-ui/react-popover';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useUpdateChatConfig } from '@shinkai_network/shinkai-node-state/v2/mutations/updateChatConfig/useUpdateChatConfig';
import { useGetChatConfig } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConfig/useGetChatConfig';
import {
  Alert,
  Button,
  Form,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
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
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Settings2 } from 'lucide-react';
import { InfoCircleIcon } from 'primereact/icons/infocircle';
import { memo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { UseFormReturn } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../../../store/auth';
import { useSettings } from '../../../store/settings';
import { ARTIFACTS_SYSTEM_PROMPT } from '../constants';
import { actionButtonClassnames } from '../conversation-footer';

export const chatConfigFormSchema = z.object({
  stream: z.boolean(),
  useTools: z.boolean(),
  customPrompt: z.string().optional(),
  temperature: z.number(),
  topP: z.number(),
  topK: z.number(),
});

export type ChatConfigFormSchemaType = z.infer<typeof chatConfigFormSchema>;

interface ChatConfigFormProps {
  form: UseFormReturn<ChatConfigFormSchemaType>;
}

function ChatConfigForm({ form }: ChatConfigFormProps) {
  const optInExperimental = useSettings((state) => state.optInExperimental);

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="stream"
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
        name="temperature"
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
                  Temperature is a parameter that affects the randomness of AI
                  outputs. Higher temp = more unexpected, lower temp = more
                  predictable.
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
                  Adjust the probability threshold to increase the relevance of
                  results. For example, a threshold of 0.9 could be optimal for
                  targeted, specific applications, whereas a threshold of 0.95
                  or 0.97 might be preferred for tasks that require broader,
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
                  Adjust the count of key words for creating sequences. This
                  parameter governs the extent of the generated passage,
                  forestalling too much repetition. Selecting a higher figure
                  yields longer narratives, whereas a smaller figure keeps the
                  text brief.
                </HoverCardContent>
              </HoverCard>
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="customPrompt"
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
      {optInExperimental && (
        <div className="flex w-full flex-col gap-3">
          <div className="flex gap-3">
            <Switch
              checked={form.watch('customPrompt') === ARTIFACTS_SYSTEM_PROMPT}
              onCheckedChange={(checked) => {
                form.setValue(
                  'customPrompt',
                  checked ? ARTIFACTS_SYSTEM_PROMPT : '',
                );
              }}
            />
            <div className="space-y-1 leading-none">
              <FormLabel className="static space-y-1.5 text-sm text-white">
                Enable UI Artifacts
              </FormLabel>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function UpdateChatConfigActionBarBase() {
  const auth = useAuth((state) => state.auth);
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const { data: chatConfig } = useGetChatConfig(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: extractJobIdFromInbox(inboxId),
    },
    { enabled: !!inboxId },
  );
  const { t } = useTranslation();

  const form = useForm<ChatConfigFormSchemaType>({
    resolver: zodResolver(chatConfigFormSchema),
    defaultValues: {
      stream: chatConfig?.stream,
      customPrompt: chatConfig?.custom_prompt ?? '',
      temperature: chatConfig?.temperature,
      topP: chatConfig?.top_p,
      topK: chatConfig?.top_k,
      useTools: chatConfig?.use_tools,
    },
  });

  const { mutateAsync: updateChatConfig } = useUpdateChatConfig({
    onSuccess: () => {
      toast.success('Chat settings updated successfully');
    },
    onError: (error) => {
      toast.error('Chat settings update failed', {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  useEffect(() => {
    if (chatConfig) {
      form.reset({
        stream: chatConfig.stream,
        customPrompt: chatConfig.custom_prompt ?? '',
        temperature: chatConfig.temperature,
        topP: chatConfig.top_p,
        topK: chatConfig.top_k,
        useTools: chatConfig.use_tools,
      });
    }
  }, [chatConfig, form]);

  const onSubmit = async (data: ChatConfigFormSchemaType) => {
    if (!inboxId) return;
    await updateChatConfig({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: extractJobIdFromInbox(inboxId),
      jobConfig: {
        stream: data.stream,
        custom_prompt: data.customPrompt ?? '',
        temperature: data.temperature,
        top_p: data.topP,
        top_k: data.topK,
        use_tools: data.useTools,
      },
    });
  };

  return (
    <div className="flex items-center gap-2">
      <ToolsDisabledAlert isToolsDisabled={!form.watch('useTools')} />
      <Popover
        onOpenChange={(open) => {
          if (open) {
            form.reset({
              stream: chatConfig?.stream,
              customPrompt: chatConfig?.custom_prompt ?? '',
              temperature: chatConfig?.temperature,
              topP: chatConfig?.top_p,
              topK: chatConfig?.top_k,
              useTools: chatConfig?.use_tools,
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
              <h2 className="leading-1 text-gray-80 mb-5 text-xs uppercase">
                Chat Settings
              </h2>

              <Form {...form}>
                <form
                  className="flex w-full flex-col justify-between gap-10 overflow-hidden"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <ChatConfigForm form={form} />
                  <div className="flex items-center justify-end gap-2">
                    <PopoverClose asChild>
                      <Button
                        className="min-w-[100px]"
                        rounded="lg"
                        size="xs"
                        variant="outline"
                      >
                        <span>{t('common.cancel')}</span>
                      </Button>
                    </PopoverClose>
                    <PopoverClose asChild>
                      <Button
                        className="min-w-[100px]"
                        rounded="lg"
                        size="xs"
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
    </div>
  );
}

export const UpdateChatConfigActionBar = memo(UpdateChatConfigActionBarBase);

export function CreateChatConfigActionBar({
  form,
}: {
  form: UseFormReturn<ChatConfigFormSchemaType>;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <ToolsDisabledAlert isToolsDisabled={!form.watch('useTools')} />
      <Popover>
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
              <h2 className="leading-1 text-gray-80 mb-5 text-xs uppercase">
                Chat Settings
              </h2>

              <Form {...form}>
                <form
                  className="flex w-full flex-col justify-between gap-10 overflow-hidden"
                  // onSubmit={form.handleSubmit(onSubmit)}
                >
                  <ChatConfigForm form={form} />
                  <div className="flex items-center justify-end gap-2">
                    <PopoverClose asChild>
                      <Button
                        className="h-9 min-w-[100px] gap-2 rounded-xl"
                        onClick={() => {
                          form.reset();
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <span>Reset to defaults</span>
                      </Button>
                    </PopoverClose>
                    <PopoverClose asChild>
                      <Button className="min-w-[100px]" rounded="lg" size="xs">
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
    </div>
  );
}

// const useSelectedAIModel = () => {
//   const defaultAgentId = useSettings((state) => state.defaultAgentId);
//   const auth = useAuth((state) => state.auth);
//
//   const { llmProviders } = useGetLLMProviders({
//     nodeAddress: auth?.node_address ?? '',
//     token: auth?.api_v2_key ?? '',
//   });
//   const selectedProvider = llmProviders?.find(
//     (provider) => provider.id === defaultAgentId,
//   );
//   return selectedProvider;
// };

const ToolsDisabledAlert = ({
  isToolsDisabled,
}: {
  isToolsDisabled?: boolean;
}) => {
  return isToolsDisabled ? (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Alert
            className={cn(
              'cursor-pointer [&>svg]:static [&>svg~*]:pl-0',
              'flex w-full items-center gap-2 rounded-lg px-3 py-1.5',
            )}
            variant="info"
          >
            <InfoCircleIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap text-xs">Tools disabled</span>
          </Alert>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>
            <p>Turn on Enable Tools in chat settings to allow tool usage.</p>
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  ) : null;
};
