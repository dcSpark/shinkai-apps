import {
  CodeLanguage,
  ToolMetadata,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useSaveToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/saveToolCode/useSaveToolCode';
import { useCallback, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../../../store/auth';
import { usePlaygroundStore } from '../context/playground-context';
import { ToolMetadataRawSchema, ToolMetadataRawSchemaType } from '../schemas';
import { CreateToolCodeFormSchema, useToolCode } from './use-tool-code';
import { useToolMetadata } from './use-tool-metadata';

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
          assets: [],
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
}: {
  form: UseFormReturn<CreateToolCodeFormSchema>;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const { forceGenerateMetadata, handleCreateToolCode } = useToolCode({
    initialState: undefined,
    initialChatInboxId: undefined,
    createToolCodeForm: form,
  });

  const toolCode = usePlaygroundStore((state) => state.toolCode);
  const toolMetadata = usePlaygroundStore((state) => state.toolMetadata);

  const toolCodeStatus = usePlaygroundStore((state) => state.toolCodeStatus);
  const toolCodeError = usePlaygroundStore((state) => state.toolCodeError);

  const isToolCodeGenerationSuccess = toolCodeStatus === 'success';
  const isToolCodeGenerationError = toolCodeStatus === 'error';
  const toolMetadataStatus = usePlaygroundStore(
    (state) => state.toolMetadataStatus,
  );
  const toolMetadataError = usePlaygroundStore(
    (state) => state.toolMetadataError,
  );

  const isMetadataGenerationSuccess = toolMetadataStatus === 'success';
  const isMetadataGenerationError = toolMetadataStatus === 'error';

  useToolMetadata({
    tools: form.watch('tools'),
    forceGenerateMetadata,
  });

  const {
    handleAutoSave,
    isSaveToolSuccess,
    isSaveToolError,
    saveToolCodeError,
  } = useAutoSaveTool();

  const createToolAndSaveTool = async (data: CreateToolCodeFormSchema) => {
    setIsProcessing(true);
    await handleCreateToolCode(data);
  };

  useEffect(() => {
    if (toolCode && toolMetadata && isToolCodeGenerationSuccess) {
      handleAutoSave({
        toolMetadata: toolMetadata,
        toolCode: toolCode,
        tools: form.getValues('tools'),
        language: form.getValues('language'),
        shouldPrefetchPlaygroundTool: true,
        onSuccess: () => {
          setIsProcessing(false);
        },
      });
    }
  }, [
    toolCode,
    toolMetadata,
    isToolCodeGenerationSuccess,
    handleAutoSave,
    form,
  ]);

  const isError =
    isToolCodeGenerationError || isMetadataGenerationError || isSaveToolError;

  useEffect(() => {
    if (isError) {
      setIsProcessing(false);
    }
  }, [isError]);

  return {
    createToolCodeForm: form,
    createToolAndSaveTool,
    isProcessing,
    isSuccess:
      isToolCodeGenerationSuccess &&
      isMetadataGenerationSuccess &&
      isSaveToolSuccess,
    isError:
      isToolCodeGenerationError || isMetadataGenerationError || isSaveToolError,
    error: toolCodeError
      ? `Failed creating tool code: ${toolCodeError}`
      : toolMetadataError
        ? `Failed creating tool metadata: ${toolMetadataError}`
        : saveToolCodeError?.response?.data?.message ??
            saveToolCodeError?.message
          ? `Failed saving tool code: ${saveToolCodeError?.response?.data?.message ?? saveToolCodeError?.message}`
          : undefined,
  };
};
