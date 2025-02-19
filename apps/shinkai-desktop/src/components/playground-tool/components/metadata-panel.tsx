import { ReloadIcon } from '@radix-ui/react-icons';
import {
  Button,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AlertTriangleIcon, SaveIcon } from 'lucide-react';
import { PrismEditor } from 'prism-react-editor';
import { memo, MutableRefObject, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
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
  initialToolRouterKeyWithVersion,
}: {
  mode: 'create' | 'edit';
  regenerateToolMetadata: () => void;
  initialToolRouterKeyWithVersion: string;
}) {
  const { toolRouterKey } = useParams();

  const [validateMetadataEditorValue, setValidateMetadataEditorValue] =
    useState<string | null>(null);

  const metadataEditorRef = usePlaygroundStore(
    (state) => state.metadataEditorRef,
  );
  const codeEditorRef = usePlaygroundStore((state) => state.codeEditorRef);
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

  const { handleAutoSave } = useAutoSaveTool();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleApplyMetadataChanges = () => {
    const currentMetadata = metadataEditorRef.current?.value;
    const currentCode = codeEditorRef.current?.value;
    if (!currentMetadata) return;

    try {
      const parsedMetadata = JSON.parse(currentMetadata);
      const mergedMetadata = merge(parsedMetadata, {
        author: toolMetadata?.author ?? '',
      });

      const parsedAll = ToolMetadataSchema.parse(mergedMetadata);
      updateToolMetadata(parsedAll);
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

  const handleMetadataUpdate = (value: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      try {
        const parseValue = JSON.parse(value);
        setValidateMetadataEditorValue(null);
        handleAutoSave({
          toolMetadata: parseValue,
          toolCode: codeEditorRef.current?.value ?? '',
          tools: form.getValues('tools'),
          language: form.getValues('language'),
          toolName: parseValue.name,
          previousToolRouterKeyWithVersion:
            initialToolRouterKeyWithVersion ?? '',
        });
      } catch (err) {
        setValidateMetadataEditorValue((err as Error).message);
        return;
      }
    }, 1000);
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col pb-4 pl-4 pr-3',
        validateMetadataEditorValue !== null &&
          'shadow-[0_0_0_1px_currentColor] shadow-red-500 transition-shadow',
      )}
    >
      {isMetadataGenerationSuccess && (
        <div className="flex items-center justify-end gap-2 py-1.5">
          {validateMetadataEditorValue !== null && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-red flex items-center">
                  <AlertTriangleIcon className="size-4" />
                </div>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  className="flex max-w-[300px] flex-col gap-3 text-xs text-white"
                  side="bottom"
                >
                  <p className="font-medium">Invalid metadata format</p>
                  <span className="text-official-gray-500">
                    {validateMetadataEditorValue}
                  </span>
                  <p className="text-official-gray-500 text-xs">
                    This value will not be saved.
                  </p>
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          )}
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
              <TooltipContent side="bottom">
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
          isError={validateMetadataEditorValue !== null}
          language="json"
          onUpdate={handleMetadataUpdate}
          ref={metadataEditorRef}
          value={
            toolMetadata != null
              ? JSON.stringify(
                  {
                    ...toolMetadata,
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
  if (
    prevProps.initialToolRouterKeyWithVersion !==
    nextProps.initialToolRouterKeyWithVersion
  ) {
    return false;
  }
  if (prevProps.mode !== nextProps.mode) {
    return false;
  }
  return true;
});
