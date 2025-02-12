import { ReloadIcon } from '@radix-ui/react-icons';
import { Button } from '@shinkai_network/shinkai-ui';
import { Loader2 } from 'lucide-react';
import { PrismEditor } from 'prism-react-editor';
import { memo, MutableRefObject } from 'react';

import { usePlaygroundStore } from '../context/playground-context';
import { ToolErrorFallback } from '../error-boundary';
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

  return (
    <div className="flex h-full flex-col pb-4 pl-4 pr-3">
      {isMetadataGenerationSuccess && (
        <div className="flex items-center justify-between gap-2 py-1">
          <p className="text-gray-80 text-xs">
            You can update the metadata to regenerate the tool code.
          </p>
          <Button
            className="text-gray-80"
            onClick={regenerateToolMetadata}
            rounded="lg"
            size="xs"
            variant="outline"
          >
            <ReloadIcon className="size-3.5" />
            Regenerate Metadata
          </Button>
        </div>
      )}
      {isMetadataGenerationPending && (
        <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
          <Loader2 className="shrink-0 animate-spin" />
          Generating Metadata...
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
        <div className="py-2">
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
        </div>
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
  return prevProps.mode === nextProps.mode;
});
