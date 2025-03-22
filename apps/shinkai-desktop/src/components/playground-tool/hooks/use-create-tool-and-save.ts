import {
  CodeLanguage,
  ToolMetadata,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useSaveToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/saveToolCode/useSaveToolCode';
import { useGetAllToolAssets } from '@shinkai_network/shinkai-node-state/v2/queries/getAllToolAssets/useGetAllToolAssets';
import { useCallback, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../../../store/auth';
import { usePlaygroundStore } from '../context/playground-context';
import { ToolMetadataRawSchema, ToolMetadataRawSchemaType } from '../schemas';
import { CreateToolCodeFormSchema } from './use-tool-code';
import { useToolFlow } from './use-tool-flow';

export const useAutoSaveTool = () => {
  const chatInboxId = usePlaygroundStore((state) => state.chatInboxId);
  const xShinkaiAppId = usePlaygroundStore((state) => state.xShinkaiAppId);
  const xShinkaiToolId = usePlaygroundStore((state) => state.xShinkaiToolId);
  const auth = useAuth((state) => state.auth);

  const navigate = useNavigate();

  const {
    mutateAsync: saveToolCode,
    isPending: isSavingTool,
    isSuccess: isSaveToolSuccess,
    isError: isSaveToolError,
    error: saveToolCodeError,
  } = useSaveToolCode();

  const { data: assets } = useGetAllToolAssets({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    xShinkaiAppId,
    xShinkaiToolId,
  });

  const handleAutoSave = useCallback(
    async ({
      previousToolRouterKeyWithVersion,
      toolMetadata,
      toolCode,
      toolName,
      toolDescription,
      tools,
      language,
      onSuccess,
      shouldPrefetchPlaygroundTool,
      version,
    }: {
      previousToolRouterKeyWithVersion?: string;
      toolMetadata: ToolMetadata;
      toolCode: string;
      toolName?: string;
      toolDescription?: string;
      tools: string[];
      language: CodeLanguage;
      shouldPrefetchPlaygroundTool?: boolean;
      onSuccess?: () => void;
      version?: string;
    }) => {
      if (!chatInboxId || !toolMetadata) return;
      let parsedMetadata: ToolMetadataRawSchemaType;
      try {
        parsedMetadata = ToolMetadataRawSchema.parse(toolMetadata);
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast.error('Invalid Metadata JSON Value', {
            description: error.issues.map((issue) => issue.message).join(', '),
          });
          return;
        }

        toast.error('Invalid Metadata JSON', {
          position: 'top-right',
          description: (error as Error)?.message,
        });
        return;
      }

      await saveToolCode(
        {
          name: toolName ?? toolMetadata.name,
          description: toolDescription ?? toolMetadata.description,
          version: version ?? toolMetadata.version ?? '0.0.1',
          tools: tools ?? [],
          code: toolCode,
          author: auth?.shinkai_identity ?? '',
          metadata: parsedMetadata,
          jobId: extractJobIdFromInbox(chatInboxId),
          token: auth?.api_v2_key ?? '',
          nodeAddress: auth?.node_address ?? '',
          language,
          assets: assets ?? [],
          xShinkaiAppId,
          xShinkaiToolId,
          ...(previousToolRouterKeyWithVersion && {
            xShinkaiOriginalToolRouterKey: previousToolRouterKeyWithVersion,
          }),
          shouldPrefetchPlaygroundTool,
        },
        {
          onSuccess: async (data) => {
            if (shouldPrefetchPlaygroundTool) {
              setTimeout(() => {
                navigate(`/tools/edit/${data.metadata.tool_router_key}`);
                onSuccess?.();
              }, 1000);
            } else {
              navigate(`/tools/edit/${data.metadata.tool_router_key}`);
              onSuccess?.();
            }
          },
          onError: (error) => {
            if (shouldPrefetchPlaygroundTool) return;
            toast.error('Failed to save tool code', {
              position: 'top-right',
              description: error.response?.data?.message ?? error.message,
            });
          },
        },
      );
    },
    [
      chatInboxId,
      saveToolCode,
      auth?.shinkai_identity,
      auth?.api_v2_key,
      auth?.node_address,
      assets,
      xShinkaiAppId,
      xShinkaiToolId,
      navigate,
    ],
  );

  return {
    handleAutoSave,
    isSavingTool,
    isSaveToolSuccess,
    isSaveToolError,
    saveToolCodeError,
  };
};

export const useCreateToolAndSave = ({
  form,
  feedbackRequired = false,
}: {
  form: UseFormReturn<CreateToolCodeFormSchema>;
  feedbackRequired?: boolean;
}) => {
  const {
    currentStep,
    error,
    isProcessing,
    toolCode,
    toolCodeStatus,
    toolMetadata,
    toolMetadataStatus,
    toolCodeError,
    toolMetadataError,
    isCreatingToolCode,
    isCreatingMetadata,
    isSavingTool,
    startToolCreation,
  } = useToolFlow({
    form,
    requireFeedbackFlow: feedbackRequired,
  });

  const isSuccess =
    toolCodeStatus === 'success' &&
    toolMetadataStatus === 'success' &&
    currentStep === 'completed';

  const isError = currentStep === 'error';

  return {
    createToolCodeForm: form,
    createToolAndSaveTool: startToolCreation,
    isProcessing,
    isSuccess,
    isError,
    error,
  };
};
