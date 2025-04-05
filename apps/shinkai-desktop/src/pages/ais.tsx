import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  EditAgentFormSchema,
  editAgentSchema,
} from '@shinkai_network/shinkai-node-state/forms/agents/edit-agent';
import { Models } from '@shinkai_network/shinkai-node-state/lib/utils/models';
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
  TextField,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { AIAgentIcon, CreateAIIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Edit, Plus, TrashIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import ProviderIcon from '../components/ais/provider-icon';
import { useURLQueryParams } from '../hooks/use-url-query-params';
import { useOllamaRemoveMutation } from '../lib/shinkai-node-manager/ollama-client';
import { useAuth } from '../store/auth';
import { useShinkaiNodeManager } from '../store/shinkai-node-manager';
import { getModelObject } from './add-ai';

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
      navigate('/install-ai-models');
      return;
    }
    navigate('/add-ai');
  };

  return (
    <div className="h-full">
      <div className="container flex h-full flex-col">
        <div className="flex flex-col gap-1 pb-6 pt-10">
          <div className="flex justify-between gap-4">
            <h1 className="font-clash text-3xl font-medium">Manage AIs</h1>
            <div className="flex gap-2">
              <Button
                className="min-w-[100px]"
                onClick={() => navigate('/agents')}
                size="sm"
                variant="outline"
              >
                <AIAgentIcon className="h-4 w-4" />
                <span>Agents</span>
              </Button>
              <Button
                className="min-w-[100px]"
                onClick={onAddAgentClick}
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span>{t('llmProviders.add')}</span>
              </Button>
            </div>
          </div>
          <p className="text-official-gray-400 text-sm">
            Easily manage both cloud and local AI models, <br />
            switching between them seamlessly to fit your workflow.
          </p>
        </div>

        <div className="flex flex-1 flex-col space-y-3 pb-10">
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

              <Button onClick={onAddAgentClick}>{t('llmProviders.add')}</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
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
          )}
        </div>
      </div>
    </div>
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
      <div className="border-official-gray-850 bg-official-gray-900 flex items-center justify-between gap-1 rounded-lg border p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-6 items-center justify-center rounded-lg">
            <ProviderIcon
              className="size-full"
              provider={model.split(':')[0]}
            />
          </div>
          <div className="flex flex-col items-baseline gap-2">
            <span className="w-full truncate text-start text-sm">
              {llmProviderId}
            </span>
            <Badge className="text-official-gray-300 bg-official-gray-850 truncate text-start text-xs font-normal shadow-none">
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
                    navigate(`/home`, { state: { llmProviderId } });
                  }}
                  size="xs"
                  variant="outline"
                >
                  <CreateAIIcon className="size-4" />
                  <span className="">Chat</span>
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
  const ollamaConfig = { host: 'http://127.0.0.1:11435' };
  const { mutateAsync: removeOllamaModel } = useOllamaRemoveMutation(
    ollamaConfig,
    {
      onSuccess: () => {
        console.log('ollama model removed:', agentId);
      },
      onError: (error) => {
        toast.error(t('llmProviders.errors.deleteAgent'), {
          description: typeof error === 'string' ? error : error.message,
        });
      },
    },
  );
  const {
    llmProviders,
    isSuccess: isSuccessLLMProviders,
    isLoading: isLoadingLLMProviders,
  } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
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
              isLoading={isPending || isLoadingLLMProviders}
              onClick={async () => {
                if (!auth) return;
                await removeLLMProvider({
                  nodeAddress: auth?.node_address ?? '',
                  llmProviderId: agentId,
                  token: auth?.api_v2_key ?? '',
                });
                let llmProviderModel = llmProviders.find(
                  (provider) => provider.id === agentId,
                )?.model;
                const isOllama =
                  llmProviderModel?.split(':')[0] === Models.Ollama;
                if (isOllama && llmProviderModel) {
                  llmProviderModel = llmProviderModel.slice(
                    llmProviderModel.indexOf(':') + 1,
                  );
                  await removeOllamaModel({ model: llmProviderModel });
                } else
                  console.warn(
                    'llmProviderModel not found for agentId:',
                    agentId,
                  );
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
