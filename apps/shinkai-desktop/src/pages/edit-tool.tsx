import validator from '@rjsf/validator-ajv8';
import { type ToolMetadata } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useGetPlaygroundTool } from '@shinkai_network/shinkai-node-state/v2/queries/getPlaygroundTool/useGetPlaygroundTool';
import { useGetProviderFromJob } from '@shinkai_network/shinkai-node-state/v2/queries/getProviderFromJob/useGetProviderFromJob';
import { useMemo } from 'react';
import { useParams } from 'react-router';

import PlaygroundToolEditor from '../components/playground-tool/components/tool-playground';
import { getLanguage } from '../components/playground-tool/utils/code';
import { useAuth } from '../store/auth';

function EditToolPage() {
  const auth = useAuth((state) => state.auth);
  const { toolRouterKey } = useParams();

  const {
    data: playgroundTool,
    isPending: isPlaygroundToolPending,
    isSuccess: isPlaygroundToolSuccess,
    isError: isPlaygroundToolError,
  } = useGetPlaygroundTool({
    token: auth?.api_v2_key ?? '',
    nodeAddress: auth?.node_address ?? '',
    toolRouterKey: toolRouterKey ?? '',
  });

  const chatInboxId = playgroundTool
    ? buildInboxIdFromJobId(playgroundTool.job_id)
    : '';

  const { data: provider } = useGetProviderFromJob({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    jobId: playgroundTool?.job_id ?? '',
  });

  const toolCodeInitialValues = useMemo(
    () => ({
      code: playgroundTool?.code ?? '',
      error: null,
      state: isPlaygroundToolPending
        ? 'pending'
        : isPlaygroundToolSuccess
          ? 'success'
          : ('idle' as 'idle' | 'pending' | 'success' | 'error'),
    }),
    [isPlaygroundToolPending, isPlaygroundToolSuccess, playgroundTool?.code],
  );

  const isValidSchema = validator.ajv.validateSchema(
    playgroundTool?.metadata?.parameters ?? {},
  );

  const toolMetadataInitialValues = useMemo(
    () => ({
      metadata: playgroundTool?.metadata as ToolMetadata | null,
      state: isPlaygroundToolPending
        ? 'pending'
        : isPlaygroundToolError || !isValidSchema
          ? 'error'
          : isPlaygroundToolSuccess
            ? 'success'
            : ('idle' as 'idle' | 'pending' | 'success' | 'error'),
      error: isValidSchema ? null : 'Tool Metadata doesnt follow the schema',
    }),
    [
      playgroundTool?.metadata,
      isPlaygroundToolPending,
      isPlaygroundToolSuccess,
      isPlaygroundToolError,
      isValidSchema,
    ],
  );

  return (
    <PlaygroundToolEditor
      createToolCodeFormInitialValues={{
        language: getLanguage(playgroundTool?.language ?? ''),
        tools: playgroundTool?.metadata?.tools ?? [],
        llmProviderId: provider?.agent?.id ?? '',
      }}
      initialChatInboxId={chatInboxId}
      initialToolRouterKeyWithVersion={
        toolRouterKey + ':::' + playgroundTool?.metadata?.version
      }
      toolCodeInitialValues={toolCodeInitialValues}
      toolDescription={playgroundTool?.metadata?.description ?? ''}
      toolMetadataInitialValues={toolMetadataInitialValues}
      toolName={playgroundTool?.metadata?.name ?? ''}
    />
  );
}

export default EditToolPage;
