import {
  CodeLanguage,
  ToolMetadata,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useSaveToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/saveToolCode/useSaveToolCode';
import { useGetAllToolAssets } from '@shinkai_network/shinkai-node-state/v2/queries/getAllToolAssets/useGetAllToolAssets';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../../../store/auth';
import { usePlaygroundStore } from '../context/playground-context';
import { ToolMetadataRawSchema, ToolMetadataRawSchemaType } from '../schemas';

export interface SaveToolParams {
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
  isPlaygroundMode?: boolean;
}

export function useToolSave() {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();

  const chatInboxId = usePlaygroundStore((state) => state.chatInboxId);
  const xShinkaiAppId = usePlaygroundStore((state) => state.xShinkaiAppId);
  const xShinkaiToolId = usePlaygroundStore((state) => state.xShinkaiToolId);
  const setToolCreationError = usePlaygroundStore(
    (state) => state.setToolCreationError,
  );

  const { mutateAsync: saveToolCode, isPending: isSavingTool } =
    useSaveToolCode();

  const { data: assets } = useGetAllToolAssets({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    xShinkaiAppId,
    xShinkaiToolId,
  });

  const handleSaveTool = useCallback(
    async ({
      previousToolRouterKeyWithVersion,
      toolMetadata,
      toolCode,
      toolName,
      toolDescription,
      tools,
      language,
      shouldPrefetchPlaygroundTool = false,
      onSuccess,
      isPlaygroundMode = false,
      version,
    }: SaveToolParams) => {
      if (!chatInboxId || !toolMetadata || !toolCode) {
        console.error('Missing required parameters for saving tool');
        return;
      }

      let parsedMetadata: ToolMetadataRawSchemaType;
      try {
        parsedMetadata = ToolMetadataRawSchema.parse(toolMetadata);
      } catch (error) {
        if (!isPlaygroundMode) {
          setToolCreationError('Invalid Metadata JSON');
        }

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
          tools,
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
            if (!isPlaygroundMode) {
              setToolCreationError('Failed to save tool code');
            }
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
      setToolCreationError,
      navigate,
    ],
  );

  return {
    handleSaveTool,
    isSavingTool,
  };
}
