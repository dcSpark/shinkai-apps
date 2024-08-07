import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useSyncOllamaModels } from '@shinkai_network/shinkai-node-state/lib/mutations/syncOllamaModels/useSyncOllamaModels';
import { Button, Progress } from '@shinkai_network/shinkai-ui';
import { useMap } from '@shinkai_network/shinkai-ui/hooks';
import { Download, Loader2, Minus } from 'lucide-react';
import { ModelResponse, ProgressResponse } from 'ollama/browser';
import { useEffect } from 'react';
import { toast } from 'sonner';

import {
  useOllamaListQuery,
  useOllamaPullingQuery,
  useOllamaPullMutation,
  useOllamaRemoveMutation,
} from '../../../lib/shinkai-node-manager/ollama-client';
import { ALLOWED_OLLAMA_MODELS } from '../../../lib/shinkai-node-manager/ollama-models';
import { useShinkaiNodeGetOllamaApiUrlQuery } from '../../../lib/shinkai-node-manager/shinkai-node-manager-client';
import { useAuth } from '../../../store/auth';
export const OllamaModelInstallButton = ({ model }: { model: string }) => {
  const { data: ollamaApiUrl } = useShinkaiNodeGetOllamaApiUrlQuery();

  const ollamaConfig = { host: ollamaApiUrl || 'http://127.0.0.1:11435' };
  const auth = useAuth((auth) => auth.auth);
  const { t } = useTranslation();
  const { isLoading: isOllamaListLoading, data: installedOllamaModels } =
    useOllamaListQuery(ollamaConfig);
  const { data: pullingModelsMap } = useOllamaPullingQuery();
  const { mutateAsync: ollamaPull } = useOllamaPullMutation(ollamaConfig, {
    onSuccess: (data, input) => {
      handlePullProgress(input.model, data);
    },
  });
  const { mutateAsync: syncOllamaModels } = useSyncOllamaModels(
    ALLOWED_OLLAMA_MODELS,
  );
  const { mutateAsync: ollamaRemove } = useOllamaRemoveMutation(ollamaConfig, {
    onSuccess: (_, input) => {
      toast.success(
        t('shinkaiNode.models.success.modelRemoved', {
          modelName: input.model,
        }),
      );
      installedOllamaModelsMap.delete(input.model);
    },
    onError: (error, input) => {
      toast.error(
        t('shinkaiNode.models.errors.modelRemoved', {
          modelName: input.model,
        }),
        {
          description: error.message,
        },
      );
    },
  });
  const installedOllamaModelsMap = useMap<string, ModelResponse>();
  const handlePullProgress = async (
    model: string,
    progressIterator: AsyncGenerator<ProgressResponse>,
  ): Promise<void> => {
    try {
      for await (const progress of progressIterator) {
        if (!progress) {
          continue;
        }
        if (progress.status === 'success') {
          toast.success(
            t('shinkaiNode.models.success.modelInstalled', {
              modelName: model,
            }),
          );
          if (auth) {
            syncOllamaModels({
              nodeAddress: auth?.node_address ?? '',
              senderSubidentity: auth?.profile ?? '',
              shinkaiIdentity: auth?.shinkai_identity ?? '',
              sender: auth?.node_address ?? '',
              my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
              my_device_identity_sk: auth?.my_device_identity_sk ?? '',
              node_encryption_pk: auth?.node_encryption_pk ?? '',
              profile_encryption_sk: auth?.profile_encryption_sk ?? '',
              profile_identity_sk: auth?.profile_identity_sk ?? '',
            });
          }
          break;
        } else if (progress.status === 'error') {
          toast.error(
            t('shinkaiNode.models.errors.modelInstalled', {
              modelName: model,
            }),
          );
        }
      }
    } catch (error) {
      toast.error(
        t('shinkaiNode.models.errors.modelInstalled', {
          modelName: model,
        }),
        {
          description: error?.toString(),
        },
      );
    }
  };
  const getProgress = (progress: ProgressResponse): number => {
    return Math.ceil((100 * (progress.completed ?? 0)) / (progress.total ?? 1));
  };
  useEffect(() => {
    installedOllamaModels?.models &&
      installedOllamaModels.models.forEach((modelResponse) => {
        installedOllamaModelsMap.set(modelResponse.name, modelResponse);
      });
  }, [installedOllamaModels?.models, installedOllamaModelsMap]);
  return (
    <div className="flex w-full items-center justify-center">
      {isOllamaListLoading ? (
        <Loader2 className="animate-spin" />
      ) : installedOllamaModelsMap.has(model) ? (
        <Button
          className="hover:border-brand w-full py-1.5 text-sm hover:text-white"
          onClick={() => {
            ollamaRemove({ model: model });
          }}
          size="auto"
          variant={'destructive'}
        >
          <Minus className="mr-2 h-3 w-3" />
          {t('common.remove')}
        </Button>
      ) : pullingModelsMap?.get(model) ? (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-gray-100">
            {getProgress(pullingModelsMap.get(model) as ProgressResponse) + '%'}
          </span>
          <Progress
            className="h-2 w-full bg-gray-200 [&>*]:bg-gray-100"
            value={getProgress(pullingModelsMap.get(model) as ProgressResponse)}
          />
          <span className="text-xs text-gray-100">
            {pullingModelsMap.get(model)?.status}
          </span>
        </div>
      ) : (
        <Button
          className="hover:border-brand w-full py-1.5 text-sm hover:bg-transparent hover:text-white"
          onClick={() => ollamaPull({ model: model })}
          size="auto"
          variant={'outline'}
        >
          <Download className="mr-2 h-4 w-4" />
          {t('common.install')}
        </Button>
      )}
    </div>
  );
};
