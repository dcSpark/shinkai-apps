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
    <div className="flex min-h-[200px] flex-col pb-4 pl-4 pr-3">
      <div className="flex items-start justify-between gap-2 py-3">
        <div className="text-gray-80 flex flex-col gap-1 text-xs">
          {/* <h2 className="flex font-mono font-semibold text-gray-50">
            Metadata
          </h2> */}
          {toolMetadata && <p>Fill in the options above to run your tool.</p>}
        </div>
        {isMetadataGenerationSuccess && (
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
        )}
      </div>
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
        <div className="text-gray-80 text-xs">
          <div className="py-2">
            <ToolCodeEditor
              language="json"
              ref={metadataEditorRef}
              style={{ height: '80vh' }}
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
