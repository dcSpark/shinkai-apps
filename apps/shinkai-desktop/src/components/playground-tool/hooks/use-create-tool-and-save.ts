import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useSaveToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/saveToolCode/useSaveToolCode';
import { PrismEditor } from 'prism-react-editor';
import { useCallback, useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { merge } from 'ts-deepmerge';
import { z } from 'zod';

import { useAuth } from '../../../store/auth';
import { usePlaygroundStore } from '../context/playground-context';
import { ToolMetadataSchema } from '../schemas';
import { ToolMetadataSchemaType } from '../schemas';
import { CreateToolCodeFormSchema, useToolCode } from './use-tool-code';
import { useToolMetadata } from './use-tool-metadata';

export const useAutoSaveTool = ({
  form,
  codeEditorRef,
  metadataEditorRef,
}: {
  form: UseFormReturn<CreateToolCodeFormSchema>;
  codeEditorRef?: React.RefObject<PrismEditor>;
  metadataEditorRef?: React.RefObject<PrismEditor>;
}) => {
  const toolCode = usePlaygroundStore((state) => state.toolCode);
  const toolMetadata = usePlaygroundStore((state) => state.toolMetadata);
  const chatInboxId = usePlaygroundStore((state) => state.chatInboxId);
  const xShinkaiAppId = usePlaygroundStore((state) => state.xShinkaiAppId);
  const xShinkaiToolId = usePlaygroundStore((state) => state.xShinkaiToolId);
  const auth = useAuth((state) => state.auth);
  const shouldAutoSaveRef = usePlaygroundStore(
    (state) => state.shouldAutoSaveRef,
  );
  const navigate = useNavigate();

  const {
    mutateAsync: saveToolCode,
    isPending: isSavingTool,
    isSuccess: isSaveToolSuccess,
  } = useSaveToolCode({
    onSuccess: (data) => {
      shouldAutoSaveRef.current = false;
      navigate(`/tools/edit/${data.metadata.tool_router_key}`);
    },
    onError: (error) => {
      toast.error('Failed to save tool code', {
        position: 'top-right',
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  const handleAutoSave = useCallback(async () => {
    if (!chatInboxId || !toolMetadata) return;

    const metadataCodeEditorValue = metadataEditorRef?.current?.value;
    const toolCodeEditorValue = codeEditorRef?.current?.value;

    let parsedMetadata: ToolMetadataSchemaType;
    try {
      const metadata = metadataCodeEditorValue
        ? JSON.parse(metadataCodeEditorValue as string)
        : toolMetadata;

      const mergedMetadata = merge(metadata, {
        name: metadata.name,
        tools: form.getValues('tools') ?? [],
        author: auth?.shinkai_identity ?? '',
      });

      parsedMetadata = ToolMetadataSchema.parse(mergedMetadata);
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

    await saveToolCode({
      name: parsedMetadata.name,
      description: parsedMetadata.description,
      version: parsedMetadata.version,
      tools: parsedMetadata.tools,
      code: toolCodeEditorValue ?? toolCode,
      metadata: parsedMetadata,
      jobId: extractJobIdFromInbox(chatInboxId),
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      language: form.getValues('language'),
      assets: [],
      xShinkaiAppId,
      xShinkaiToolId,
    });
  }, [
    chatInboxId,
    toolMetadata,
    metadataEditorRef,
    codeEditorRef,
    saveToolCode,
    toolCode,
    auth?.api_v2_key,
    auth?.node_address,
    auth?.shinkai_identity,
    form,
    xShinkaiAppId,
    xShinkaiToolId,
  ]);

  return {
    handleAutoSave,
    isSavingTool,
    isSaveToolSuccess,
  };
};

export const useCreateToolAndSave = ({
  form,
}: {
  form: UseFormReturn<CreateToolCodeFormSchema>;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const shouldAutoSaveRef = usePlaygroundStore(
    (state) => state.shouldAutoSaveRef,
  );

  const { forceGenerateMetadata, handleCreateToolCode } = useToolCode({
    initialState: undefined,
    initialChatInboxId: undefined,
    createToolCodeForm: form,
  });

  const toolCode = usePlaygroundStore((state) => state.toolCode);
  const toolMetadata = usePlaygroundStore((state) => state.toolMetadata);

  const toolCodeStatus = usePlaygroundStore((state) => state.toolCodeStatus);
  const isToolCodeGenerationPending = toolCodeStatus === 'pending';
  const isToolCodeGenerationSuccess = toolCodeStatus === 'success';

  const toolMetadataStatus = usePlaygroundStore(
    (state) => state.toolMetadataStatus,
  );

  const isMetadataGenerationPending = toolMetadataStatus === 'pending';
  const isMetadataGenerationSuccess = toolMetadataStatus === 'success';

  useToolMetadata({
    tools: form.watch('tools'),
    forceGenerateMetadata,
  });

  const { handleAutoSave, isSavingTool, isSaveToolSuccess } = useAutoSaveTool({
    form,
  });

  const createToolAndSaveTool = async (data: CreateToolCodeFormSchema) => {
    setIsProcessing(true);
    shouldAutoSaveRef.current = true;
    await handleCreateToolCode(data);
  };

  useEffect(() => {
    if (
      toolCode &&
      toolMetadata &&
      isToolCodeGenerationSuccess &&
      shouldAutoSaveRef.current
    ) {
      handleAutoSave();
    }
  }, [
    toolCode,
    toolMetadata,
    isToolCodeGenerationSuccess,
    handleAutoSave,
    shouldAutoSaveRef,
  ]);

  useEffect(() => {
    if (isSaveToolSuccess) {
      setIsProcessing(false);
    }
  }, [isSaveToolSuccess]);

  return {
    createToolCodeForm: form,
    createToolAndSaveTool,
    isProcessing,
    isSuccess:
      isToolCodeGenerationSuccess &&
      isMetadataGenerationSuccess &&
      isSaveToolSuccess,
  };
};
