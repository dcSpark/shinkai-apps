import { ReloadIcon } from '@radix-ui/react-icons';
import {
  Button,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { debounce } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AlertTriangleIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { usePlaygroundStore } from '../context/playground-context';
import { ToolErrorFallback } from '../error-boundary';
import { useAutoSaveTool } from '../hooks/use-create-tool-and-save';
import { CreateToolCodeFormSchema } from '../hooks/use-tool-code';
import ToolCodeEditor from '../tool-code-editor';

function MetadataPanelBase({
  regenerateToolMetadata,
  initialToolRouterKeyWithVersion,
}: {
  regenerateToolMetadata: () => void;
  initialToolRouterKeyWithVersion: string;
}) {
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

  const handleMetadataUpdate = debounce((value: string) => {
    if (value === JSON.stringify(toolMetadata, null, 2)) {
      return;
    }

    try {
      const parseValue = JSON.parse(value);
      updateToolMetadata(parseValue);
      setValidateMetadataEditorValue(null);
      handleAutoSave({
        toolMetadata: parseValue,
        toolCode: codeEditorRef.current?.value ?? '',
        tools: form.getValues('tools'),
        language: form.getValues('language'),
        toolName: parseValue.name,
        previousToolRouterKeyWithVersion: initialToolRouterKeyWithVersion ?? '',
      });
    } catch (err) {
      setValidateMetadataEditorValue((err as Error).message);
      return;
    }
  }, 750);

  return (
    <div
      className={cn(
        'flex h-full flex-col pb-4 pl-4 pr-3',
        validateMetadataEditorValue !== null &&
          'ring-1 ring-inset ring-red-600 transition-shadow',
      )}
    >
      {isMetadataGenerationSuccess && (
        <div className={cn('flex items-center justify-end gap-3 px-2 py-1.5')}>
          {validateMetadataEditorValue !== null && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-red flex items-center">
                  <AlertTriangleIcon className="size-4" />
                </div>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  className="bg-official-gray-1000 flex max-w-[300px] flex-col gap-2.5 text-xs text-white"
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
              <TooltipContent
                className="bg-official-gray-1000 flex max-w-[300px] flex-col gap-2.5 text-xs text-white"
                side="bottom"
              >
                <p>Regenerate metadata</p>
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
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
            <div className="ml-4 flex items-center gap-2">
              <Skeleton className="h-4 w-32 bg-zinc-800" />
              <Skeleton className="h-4 w-4 bg-zinc-800" />
            </div>
            {[...Array(4)].map((_, i) => (
              <div className="ml-8 flex items-center gap-2" key={i}>
                <Skeleton className="h-4 w-40 bg-zinc-800" />
                <Skeleton className="h-4 w-24 bg-zinc-800" />
              </div>
            ))}
            <div className="ml-4 flex items-center gap-2">
              <Skeleton className="h-4 w-28 bg-zinc-800" />
              <Skeleton className="h-4 w-4 bg-zinc-800" />
            </div>
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

      {isMetadataGenerationSuccess &&
        !isMetadataGenerationError &&
        toolMetadata && (
          <ToolCodeEditor
            language="json"
            onUpdate={handleMetadataUpdate}
            ref={metadataEditorRef}
            value={JSON.stringify(toolMetadata, null, 2)}
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
  return true;
});
