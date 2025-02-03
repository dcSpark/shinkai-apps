import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  EditAgentFormSchema,
  editAgentSchema,
} from '@shinkai_network/shinkai-node-state/forms/agents/edit-agent';
import { useRemoveLLMProvider } from '@shinkai_network/shinkai-node-state/v2/mutations/removeLLMProvider/useRemoveLLMProvider';
import { useUpdateLLMProvider } from '@shinkai_network/shinkai-node-state/v2/mutations/updateLLMProvider/useUpdateLLMProvider';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import {
  Badge,
  Button,
  buttonVariants,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Form,
  FormField,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextField,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { ScrollArea } from '@shinkai_network/shinkai-ui';
import { CreateAIIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { BotIcon, Edit, Plus, TrashIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Agents from '../components/agent/agents';
import { useURLQueryParams } from '../hooks/use-url-query-params';
import { useAuth } from '../store/auth';
import { useShinkaiNodeManager } from '../store/shinkai-node-manager';
import { getModelObject } from './add-ai';
import { SimpleLayout } from './layout/simple-layout';

const AIsPage = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const { llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const isLocalShinkaiNodeIsUse = useShinkaiNodeManager(
    (state) => state.isInUse,
  );
  const query = useURLQueryParams();
  const tabSelected = query.get('tab') ?? 'ais';

  const onAddAgentClick = () => {
    if (isLocalShinkaiNodeIsUse) {
      navigate('/local-ais');
      return;
    }
    navigate('/add-ai');
  };

  return (
    <SimpleLayout>
      <Tabs
        className="relative flex h-full flex-col"
        defaultValue={tabSelected}
      >
        <TabsList
          className={cn(
            'grid w-full max-w-[200px] grid-cols-2 overflow-auto rounded-lg border border-gray-400 bg-transparent p-0.5',
          )}
        >
          <TabsTrigger
            className="flex h-8 items-center gap-1.5 text-xs font-semibold"
            value="ais"
          >
            AIs
          </TabsTrigger>
          <TabsTrigger
            className="flex h-8 items-center gap-1.5 text-xs font-semibold"
            value="agents"
          >
            Agents
          </TabsTrigger>
        </TabsList>
        <TabsContent className="h-full" value="ais">
          <div className="absolute right-3 top-0">
            <Button
              className="min-w-[100px]"
              onClick={onAddAgentClick}
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span>{t('llmProviders.add')}</span>
            </Button>
          </div>
          <div className="flex h-full flex-col space-y-3">
            {!llmProviders?.length ? (
              <div className="flex grow flex-col items-center justify-center">
                <div className="mb-8 space-y-3 text-center">
                  <span aria-hidden className="text-5xl">
                    🤖
                  </span>
                  <p className="text-2xl font-semibold">
                    {t('llmProviders.notFound.title')}
                  </p>
                  <p className="text-center text-sm font-medium text-gray-100">
                    {t('llmProviders.notFound.description')}
                  </p>
                </div>

                <Button onClick={onAddAgentClick}>
                  {t('llmProviders.add')}
                </Button>
              </div>
            ) : (
              <ScrollArea className="flex h-full flex-col justify-between [&>div>div]:!block">
                <div className="divide-y divide-gray-400">
                  {llmProviders?.map((llmProvider) => (
                    <LLMProviderCard
                      agentApiKey={llmProvider.api_key ?? ''}
                      externalUrl={llmProvider.external_url ?? ''}
                      key={llmProvider.id}
                      llmProviderId={llmProvider.id}
                      model={llmProvider.model}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>
        <TabsContent className="h-full" value="agents">
          <Agents />
        </TabsContent>
      </Tabs>
    </SimpleLayout>
  );
};

export default AIsPage;

function LLMProviderCard({
  llmProviderId,
  model,
  externalUrl,
  agentApiKey,
}: {
  llmProviderId: string;
  model: string;
  externalUrl: string;
  agentApiKey: string;
}) {
  const { t } = useTranslation();
  const [isDeleteAgentDrawerOpen, setIsDeleteAgentDrawerOpen] =
    React.useState(false);
  const [isEditAgentDrawerOpen, setIsEditAgentDrawerOpen] =
    React.useState(false);

  const navigate = useNavigate();

  return (
    <React.Fragment>
      <div className="flex cursor-pointer items-center justify-between gap-1 rounded-lg py-2.5 pr-2.5 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-400">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <BotIcon className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-baseline gap-2">
            <span className="w-full truncate text-start text-sm">
              {llmProviderId}
            </span>
            <Badge className="text-gray-80 truncate bg-gray-400 text-start text-xs font-normal shadow-none">
              {model}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    navigate(`/inboxes`, { state: { llmProviderId } });
                  }}
                  size="sm"
                  variant="gradient"
                >
                  <CreateAIIcon className="size-4" />
                  <span className="sr-only">New Chat</span>
                </Button>
              </TooltipTrigger>

              <TooltipPortal>
                <TooltipContent
                  align="center"
                  className="flex flex-col items-center gap-1"
                  side="right"
                >
                  Create New Chat
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <div
                className={cn(
                  buttonVariants({
                    variant: 'tertiary',
                    size: 'icon',
                  }),
                  'border-0 hover:bg-gray-500/40',
                )}
                onClick={(event) => {
                  event.stopPropagation();
                }}
                role="button"
                tabIndex={0}
              >
                <span className="sr-only">{t('common.moreOptions')}</span>
                <DotsVerticalIcon className="text-gray-100" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[160px] border bg-gray-500 px-2.5 py-2"
            >
              {[
                {
                  name: t('common.edit'),
                  icon: <Edit className="mr-3 h-4 w-4" />,
                  onClick: () => {
                    setIsEditAgentDrawerOpen(true);
                  },
                },
                {
                  name: t('common.delete'),
                  icon: <TrashIcon className="mr-3 h-4 w-4" />,
                  onClick: () => {
                    setIsDeleteAgentDrawerOpen(true);
                  },
                },
              ].map((option) => (
                <React.Fragment key={option.name}>
                  {option.name === 'Delete' && (
                    <DropdownMenuSeparator className="bg-gray-300" />
                  )}
                  <DropdownMenuItem
                    key={option.name}
                    onClick={(event) => {
                      event.stopPropagation();
                      option.onClick();
                    }}
                  >
                    {option.icon}
                    {option.name}
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <EditLLMProviderDrawer
        agentApiKey={agentApiKey}
        agentExternalUrl={externalUrl}
        agentId={llmProviderId}
        agentModelProvider={model.split(':')[0]}
        agentModelType={model.split(':')[1]}
        onOpenChange={setIsEditAgentDrawerOpen}
        open={isEditAgentDrawerOpen}
      />
      <RemoveLLMProviderModal
        agentId={llmProviderId}
        onOpenChange={setIsDeleteAgentDrawerOpen}
        open={isDeleteAgentDrawerOpen}
      />
    </React.Fragment>
  );
}

const EditLLMProviderDrawer = ({
  open,
  onOpenChange,
  agentId,
  agentModelProvider,
  agentModelType,
  agentExternalUrl,
  agentApiKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentModelProvider: string;
  agentModelType: string;
  agentExternalUrl: string;
  agentApiKey: string;
}) => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);

  const form = useForm<EditAgentFormSchema>({
    resolver: zodResolver(editAgentSchema),
  });

  useEffect(() => {
    form.reset({
      agentName: agentId,
      externalUrl: agentExternalUrl,
      apikey: agentApiKey,
      modelCustom: agentModelProvider,
      modelTypeCustom: agentModelType,
    });
  }, [
    agentId,
    agentModelProvider,
    agentModelType,
    agentExternalUrl,
    agentApiKey,
  ]);

  const { mutateAsync: updateLLMProvider, isPending } = useUpdateLLMProvider({
    onSuccess: () => {
      onOpenChange(false);
      toast.success(t('llmProviders.success.updateAgent'));
    },
    onError: (error) => {
      toast.error(t('llmProviders.errors.updateAgent'), {
        description: typeof error === 'string' ? error : error.message,
      });
    },
  });

  const submit = async (values: EditAgentFormSchema) => {
    if (!auth) return;
    const model = getModelObject(values.modelCustom, values.modelTypeCustom);

    await updateLLMProvider({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      agent: {
        allowed_message_senders: [],
        api_key: values.apikey,
        external_url: values.externalUrl,
        full_identity_name: `${auth.shinkai_identity}/${auth.profile}/agent/${agentId}`,
        id: agentId,
        perform_locally: false,
        storage_bucket_permissions: [],
        toolkit_permissions: [],
        model,
      },
    });
  };

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader className="mb-6">
          <SheetTitle className="font-normal">
            {t('common.update')} <span className="font-medium">{agentId}</span>{' '}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            className="flex flex-col justify-between space-y-6"
            onSubmit={form.handleSubmit(submit)}
          >
            <div className="flex grow flex-col space-y-3">
              <FormField
                control={form.control}
                disabled
                name="agentName"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={t('llmProviders.form.agentName')}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="externalUrl"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={t('llmProviders.form.externalUrl')}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="apikey"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={t('llmProviders.form.apiKey')}
                    type="password"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="modelCustom"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={t('llmProviders.form.modelProvider')}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="modelTypeCustom"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={t('llmProviders.form.modelId')}
                  />
                )}
              />
            </div>
            <Button
              className="w-full"
              disabled={isPending}
              isLoading={isPending}
              type="submit"
            >
              {t('common.save')}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

const RemoveLLMProviderModal = ({
  open,
  onOpenChange,
  agentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
}) => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const { mutateAsync: removeLLMProvider, isPending } = useRemoveLLMProvider({
    onSuccess: () => {
      onOpenChange(false);
      toast.success(t('llmProviders.success.deleteAgent'));
    },
    onError: (error) => {
      toast.error(t('llmProviders.errors.deleteAgent'), {
        description: typeof error === 'string' ? error : error.message,
      });
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="pb-0">
          {t('llmProviders.delete.label')}{' '}
          <span className="font-mono font-medium">{agentId}</span>{' '}
        </DialogTitle>
        <DialogDescription>
          {t('llmProviders.delete.description')}
        </DialogDescription>

        <DialogFooter>
          <div className="flex gap-2 pt-4">
            <DialogClose asChild className="flex-1">
              <Button
                className="min-w-[100px] flex-1"
                size="sm"
                type="button"
                variant="ghost"
              >
                {t('common.cancel')}
              </Button>
            </DialogClose>
            <Button
              className="min-w-[100px] flex-1"
              isLoading={isPending}
              onClick={async () => {
                if (!auth) return;
                await removeLLMProvider({
                  nodeAddress: auth?.node_address ?? '',
                  llmProviderId: agentId,
                  token: auth?.api_v2_key ?? '',
                });
              }}
              size="sm"
              variant="destructive"
            >
              {t('common.delete')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
