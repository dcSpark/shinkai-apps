import { ReloadIcon } from '@radix-ui/react-icons';
import {
  Button,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { SaveIcon } from 'lucide-react';
import { PrismEditor } from 'prism-react-editor';
import { memo, MutableRefObject } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { merge } from 'ts-deepmerge';
import { z } from 'zod';

import { usePlaygroundStore } from '../context/playground-context';
import { ToolErrorFallback } from '../error-boundary';
import { useAutoSaveTool } from '../hooks/use-create-tool-and-save';
import { CreateToolCodeFormSchema } from '../hooks/use-tool-code';
import { ToolMetadataSchema } from '../schemas';
import ToolCodeEditor from '../tool-code-editor';

function MetadataPanelBase({
  mode,
  regenerateToolMetadata,
  metadataEditorRef,
}: {
  mode: 'create' | 'edit';
  regenerateToolMetadata: () => void;
  metadataEditorRef: MutableRefObject<PrismEditor | null>;
}) {
  const toolMetadata = usePlaygroundStore((state) => state.toolMetadata);
  const updateToolMetadata = usePlaygroundStore(
    (state) => state.updateToolMetadata,
  );
  const toolMetadataStatus = usePlaygroundStore(
    (state) => state.toolMetadataStatus,
  );
  const toolMetadataError = usePlaygroundStore(
    (state) => state.toolMetadataError,
  );

  const toolCodeStatus = usePlaygroundStore((state) => state.toolCodeStatus);

  const isToolCodeGenerationPending = toolCodeStatus === 'pending';

  const isMetadataGenerationIdle = toolMetadataStatus === 'idle';
  const isMetadataGenerationSuccess = toolMetadataStatus === 'success';
  const isMetadataGenerationPending = toolMetadataStatus === 'pending';
  const isMetadataGenerationError = toolMetadataStatus === 'error';

  const form = useFormContext<CreateToolCodeFormSchema>();

  const { handleAutoSave, isSavingTool, isSaveToolSuccess } = useAutoSaveTool({
    form,
    metadataEditorRef,
  });

  const handleApplyMetadataChanges = () => {
    const currentMetadata = metadataEditorRef.current?.value;
    if (!currentMetadata) return;

    try {
      const parsedMetadata = JSON.parse(currentMetadata);
      const mergedMetadata = merge(parsedMetadata, {
        // override values
        name: toolMetadata?.name ?? '',
        author: toolMetadata?.author ?? '',
      });

      const parsedAll = ToolMetadataSchema.parse(mergedMetadata);

      updateToolMetadata(parsedAll);
      handleAutoSave();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error('Invalid metadata format', {
          description: error.issues.map((issue) => issue.message).join(', '),
        });
      } else {
        toast.error('Invalid JSON format', {
          description: (error as Error).message,
        });
      }
    }
  };

  return (
    <div className="flex h-full flex-col pb-4 pl-4 pr-3">
      {isMetadataGenerationSuccess && (
        <div className="flex items-center justify-end gap-2 py-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="!size-[28px] rounded-lg border-0 bg-transparent p-2"
                onClick={regenerateToolMetadata}
                size="xs"
                type="button"
                variant="ghost"
              >
                <ReloadIcon className="size-full" />
              </Button>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent side="left">
                <p>Regenerate metadata</p>
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
          <Button
            className="!h-[28px] rounded-lg border-0 bg-transparent"
            onClick={handleApplyMetadataChanges}
            size="xs"
            type="button"
            variant="ghost"
          >
            Apply Changes
          </Button>
        </div>
      )}
      {isMetadataGenerationPending && (
        <div className="text-gray-80 flex flex-col gap-2 py-4 text-xs">
          <div className="space-y-3 font-mono text-sm">
            <div className="ml-4 flex items-center gap-2">
              <Skeleton className="h-4 w-24 bg-zinc-800" />
              <Skeleton className="h-4 w-32 bg-zinc-800" />
            </div>
            <div className="ml-4 flex items-center gap-2">
              <Skeleton className="h-4 w-28 bg-zinc-800" />
              <Skeleton className="h-4 w-96 bg-zinc-800" />
            </div>
            <div className="ml-4 flex items-center gap-2">
              <Skeleton className="h-4 w-20 bg-zinc-800" />
              <Skeleton className="h-4 w-4 bg-zinc-800" />
            </div>
            {[...Array(3)].map((_, i) => (
              <div className="ml-8 flex items-center gap-2" key={i}>
                <Skeleton className="h-4 w-28 bg-zinc-800" />
              </div>
            ))}
            <div className="ml-4 flex items-center gap-2">
              <Skeleton className="h-4 w-4 bg-zinc-800" />
            </div>
            {/* Configurations */}
            <div className="ml-4 flex items-center gap-2">
              <Skeleton className="h-4 w-32 bg-zinc-800" />
              <Skeleton className="h-4 w-4 bg-zinc-800" />
            </div>
            {/* Nested configuration content */}
            {[...Array(4)].map((_, i) => (
              <div className="ml-8 flex items-center gap-2" key={i}>
                <Skeleton className="h-4 w-40 bg-zinc-800" />
                <Skeleton className="h-4 w-24 bg-zinc-800" />
              </div>
            ))}
            {/* Parameters section */}
            <div className="ml-4 flex items-center gap-2">
              <Skeleton className="h-4 w-28 bg-zinc-800" />
              <Skeleton className="h-4 w-4 bg-zinc-800" />
            </div>
            {/* Nested parameters content */}
            {[...Array(5)].map((_, i) => (
              <div className="ml-8 flex items-center gap-2" key={i}>
                <Skeleton className="h-4 w-36 bg-zinc-800" />
                {i % 2 === 0 && <Skeleton className="h-4 w-48 bg-zinc-800" />}
              </div>
            ))}
          </div>
          <span className="sr-only">Generating Metadata...</span>
        </div>
      )}
      {!isMetadataGenerationPending &&
        !isToolCodeGenerationPending &&
        isMetadataGenerationError && (
          <ToolErrorFallback
            error={new Error(toolMetadataError ?? '')}
            resetErrorBoundary={regenerateToolMetadata}
          />
        )}

      {isMetadataGenerationSuccess && !isMetadataGenerationError && (
        <ToolCodeEditor
          language="json"
          ref={metadataEditorRef}
          value={
            toolMetadata != null
              ? JSON.stringify(
                  {
                    ...toolMetadata,
                    name: mode === 'edit' ? undefined : toolMetadata.name,
                    tools: undefined,
                    author: undefined,
                  },
                  null,
                  2,
                )
              : 'Invalid metadata'
          }
        />
      )}
      {isMetadataGenerationIdle && (
        <div>
          <p className="text-gray-80 py-4 pt-6 text-center text-xs">
            No metadata generated yet.
          </p>
        </div>
      )}
    </div>
  );
}

export const MetadataPanel = memo(MetadataPanelBase, (prevProps, nextProps) => {
  if (prevProps.regenerateToolMetadata !== nextProps.regenerateToolMetadata) {
    return false;
  }
  if (prevProps.mode !== nextProps.mode) {
    return false;
  }
  return true;
});
