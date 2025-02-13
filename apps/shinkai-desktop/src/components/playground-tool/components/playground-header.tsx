import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils';
import { useRestoreToolConversation } from '@shinkai_network/shinkai-node-state/v2/mutations/restoreToolConversation/useRestoreToolConversation';
import { useSaveToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/saveToolCode/useSaveToolCode';
import { useGetAllToolAssets } from '@shinkai_network/shinkai-node-state/v2/queries/getAllToolAssets/useGetAllToolAssets';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { Badge, Separator, Tooltip } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Loader2, Play, Redo2Icon, Save, Undo2Icon } from 'lucide-react';
import { PrismEditor } from 'prism-react-editor';
import { memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { merge } from 'ts-deepmerge';
import { z } from 'zod';

import { useAuth } from '../../../store/auth';
import { usePlaygroundStore } from '../context/playground-context';
import { CreateToolCodeFormSchema } from '../hooks/use-tool-code';
import { ToolMetadataSchemaType } from '../schemas';
import { ToolMetadataSchema } from '../schemas';
import { ManageSourcesButton } from './manage-sources-button';

function PlaygroundHeaderBase({
  toolHistory,
  mode,
  toolName,
  isExecutionToolCodePending,
  baseToolCodeRef,
  metadataEditorRef,
  codeEditorRef,
  initialToolName,
  initialChatInboxId,
}: {
  toolHistory: {
    messageId: string;
    code: string;
  }[];
  mode: 'create' | 'edit';
  toolName: string;
  isExecutionToolCodePending: boolean;
  baseToolCodeRef: React.MutableRefObject<string>;
  metadataEditorRef: React.MutableRefObject<PrismEditor | null>;
  codeEditorRef: React.MutableRefObject<PrismEditor | null>;
  initialToolName?: string;
  initialChatInboxId?: string;
}) {
  const navigate = useNavigate();
  const auth = useAuth((state) => state.auth);
  const toolCode = usePlaygroundStore((state) => state.toolCode);
  const setToolCode = usePlaygroundStore((state) => state.setToolCode);
  const chatInboxId = usePlaygroundStore((state) => state.chatInboxId);
  const setResetCounter = usePlaygroundStore((state) => state.setResetCounter);
  const xShinkaiAppId = usePlaygroundStore((state) => state.xShinkaiAppId);
  const xShinkaiToolId = usePlaygroundStore((state) => state.xShinkaiToolId);

  const toolMetadata = usePlaygroundStore((state) => state.toolMetadata);

  const createToolCodeForm = useFormContext<CreateToolCodeFormSchema>();

  const isToolCodeGenerationPending = usePlaygroundStore(
    (state) => state.toolCodeStatus === 'pending',
  );

  const isMetadataGenerationSuccess = usePlaygroundStore(
    (state) => state.toolMetadataStatus === 'success',
  );
  const isMetadataGenerationError = usePlaygroundStore(
    (state) => state.toolMetadataStatus === 'error',
  );

  const { data: assets } = useGetAllToolAssets({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    xShinkaiAppId,
    xShinkaiToolId,
  });

  const {
    mutateAsync: restoreToolConversation,
    isPending: isRestoringToolConversation,
  } = useRestoreToolConversation({
    onSuccess: () => {
      toast.success('Successfully restore changes');
    },
    onError: (error) => {
      toast.error('Failed to restore tool conversation', {
        position: 'top-right',
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  const { mutateAsync: saveToolCode, isPending: isSavingTool } =
    useSaveToolCode({
      onSuccess: (data) => {
        toast.success('Tool code saved successfully');
        navigate(`/tools/${data.metadata.tool_router_key}`);
      },
      onError: (error) => {
        toast.error('Failed to save tool code', {
          position: 'top-right',
          description: error.response?.data?.message ?? error.message,
        });
      },
    });

  const restoreCode = async () => {
    const currentIdx = toolHistory.findIndex(
      (history) => history.code === toolCode,
    );

    await restoreToolConversation({
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      jobId: extractJobIdFromInbox(chatInboxId ?? ''),
      messageId: toolHistory[currentIdx].messageId,
    });
  };

  const goPreviousToolCode = () => {
    const currentIdx = toolHistory.findIndex(
      (history) => history.code === toolCode,
    );
    const prevTool = toolHistory[currentIdx - 1];

    const messageEl = document.getElementById(prevTool.messageId);
    baseToolCodeRef.current = prevTool.code;
    setToolCode(prevTool.code);
    setResetCounter((prev) => prev + 1);
    if (messageEl) {
      // wait til requestAnimationFrame for scrolling
      setTimeout(() => {
        messageEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  };

  const goNextToolCode = () => {
    const currentIdx = toolHistory.findIndex(
      (history) => history.code === toolCode,
    );
    const nextTool = toolHistory[currentIdx + 1];
    baseToolCodeRef.current = nextTool.code;
    setToolCode(nextTool.code);
    setResetCounter((prev) => prev + 1);

    const messageEl = document.getElementById(nextTool.messageId);
    if (messageEl) {
      setTimeout(() => {
        messageEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  };

  const handleSaveTool = async () => {
    if (!chatInboxId) return;

    const metadataCode = metadataEditorRef.current?.value;
    const toolCode = codeEditorRef.current?.value;

    let parsedMetadata: ToolMetadataSchemaType;

    try {
      const parseResult = JSON.parse(
        metadataCode as string,
      ) as ToolMetadataSchemaType;

      const mergedMetadata = merge(parseResult, {
        // override values
        name: initialChatInboxId ? initialToolName ?? '' : parseResult.name,
        tools: createToolCodeForm.getValues('tools') ?? [],
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
      code: toolCode,
      metadata: parsedMetadata,
      jobId: extractJobIdFromInbox(chatInboxId),
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      language: createToolCodeForm.getValues('language'),
      assets: assets ?? [],
      xShinkaiAppId,
      xShinkaiToolId,
    });
  };

  return (
    <div className="grid grid-cols-3 items-center justify-between gap-2 border-b border-gray-400 px-4 pb-2.5">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger
            className="flex items-center gap-1 rounded-lg p-1 text-base font-medium"
            disabled
          >
            {mode === 'create' ? 'New Tool' : toolName}
            {/* <ChevronDown className="ml-1 h-4 w-4" /> */}
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-64 bg-gray-600"
            sideOffset={10}
          />
        </Popover>
        {toolHistory.length > 1 && (
          <div className="flex items-center gap-4">
            {toolCode === toolHistory?.at(-1)?.code ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    className="border-cyan-600 bg-cyan-900/20 font-normal text-cyan-400"
                    variant="inputAdornment"
                  >
                    Latest
                  </Badge>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent side="bottom">
                    <p>This is your latest version</p>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    className="bg-gray-350 cursor-pointer border-0 px-2.5 py-2 hover:bg-gray-400"
                    onClick={restoreCode}
                    variant="secondary"
                  >
                    {isRestoringToolConversation ? (
                      <Loader2 className={cn('mr-2 h-4 w-4 animate-spin')} />
                    ) : null}
                    <span>Restore</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent className="max-w-sm" side="bottom">
                    <p>
                      Restore to this version. This action will undo all changes
                      made since the selected version
                    </p>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            )}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger
                  asChild
                  disabled={toolCode === toolHistory?.at(0)?.code}
                >
                  <Button
                    className="size-[30px] rounded-lg p-1 disabled:pointer-events-none disabled:bg-transparent disabled:text-gray-100"
                    onClick={goPreviousToolCode}
                    size="auto"
                    variant="ghost"
                  >
                    <Undo2Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent side="bottom">
                    <p>View previous version</p>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  asChild
                  disabled={toolCode === toolHistory?.at(-1)?.code}
                >
                  <Button
                    className="size-[30px] rounded-lg p-1 disabled:pointer-events-none disabled:bg-transparent disabled:text-gray-100"
                    onClick={goNextToolCode}
                    size="auto"
                    variant="ghost"
                  >
                    <Redo2Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent side="bottom">
                    <p>View next version</p>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </div>
            <Separator className="my-1 bg-gray-300" orientation="vertical" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2.5">
        <Button
          className="text-white"
          disabled={
            !isMetadataGenerationSuccess ||
            isToolCodeGenerationPending ||
            isMetadataGenerationError
          }
          form="parameters-form"
          isLoading={isExecutionToolCodePending}
          rounded="lg"
          size="xs"
        >
          {!isExecutionToolCodePending && <Play className="h-4 w-4" />}
          Run
        </Button>
      </div>
      <div className="flex items-center justify-end gap-2.5">
        <ManageSourcesButton />
        <Button
          className="shrink-0"
          disabled={!toolCode || !toolMetadata || !chatInboxId || isSavingTool}
          isLoading={isSavingTool}
          onClick={handleSaveTool}
          rounded="lg"
          size="xs"
          variant="outline"
        >
          <Save className="h-4 w-4" />
          Save Tool
        </Button>
      </div>
    </div>
  );
}

export const PlaygroundHeader = memo(PlaygroundHeaderBase, (prev, next) => {
  if (prev.initialChatInboxId !== next.initialChatInboxId) return false;
  if (prev.initialToolName !== next.initialToolName) return false;
  if (prev.toolHistory.length !== next.toolHistory.length) return false;
  return true;
});
