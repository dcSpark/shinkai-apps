import { FormProps } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { useGetShinkaiFileProtocol } from '@shinkai_network/shinkai-node-state/v2/queries/getShinkaiFileProtocol/useGetShinkaiFileProtocol';
import {
  Button,
  JsonForm,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shinkai_network/shinkai-ui';
import { fileIconMap, FileTypeIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { save } from '@tauri-apps/plugin-dialog';
import * as fs from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Paperclip, Play, RefreshCw } from 'lucide-react';
import { memo, MutableRefObject, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../../store/auth';
import { usePlaygroundStore } from '../context/playground-context';
import { ToolErrorFallback } from '../error-boundary';
import ToolCodeEditor from '../tool-code-editor';

function ExecutionPanelBase({
  isExecutionToolCodeSuccess,
  isExecutionToolCodeError,
  isExecutionToolCodePending,
  executionToolCodeError,
  mountTimestampRef,
  toolResultFiles,
  handleRunCode,
  regenerateToolMetadata,
  onRefreshMetadata,
}: {
  isExecutionToolCodeSuccess: boolean;
  isExecutionToolCodeError: boolean;
  isExecutionToolCodePending: boolean;
  executionToolCodeError?: string;
  mountTimestampRef: MutableRefObject<Date>;
  toolResultFiles: string[];
  handleRunCode: FormProps['onSubmit'];
  regenerateToolMetadata: () => void;
  onRefreshMetadata?: () => void;
}) {
  const [formData, setFormData] = useState(null);
  // Add a key state to force re-mounting of the JsonForm when needed.
  const [formKey, setFormKey] = useState(0);

  const toolCodeStatus = usePlaygroundStore((state) => state.toolCodeStatus);
  const isToolCodeGenerationPending = toolCodeStatus === 'pending';

  const toolResult = usePlaygroundStore((state) => state.toolResult);

  const toolMetadata = usePlaygroundStore((state) => state.toolMetadata);
  const toolMetadataStatus = usePlaygroundStore(
    (state) => state.toolMetadataStatus,
  );
  const toolMetadataError = usePlaygroundStore(
    (state) => state.toolMetadataError,
  );
  const isMetadataGenerationIdle = toolMetadataStatus === 'idle';
  const isMetadataGenerationSuccess = toolMetadataStatus === 'success';
  const isMetadataGenerationError = toolMetadataStatus === 'error';
  const isMetadataGenerationPending = toolMetadataStatus === 'pending';

  // Add useEffect to reset form when metadata changes
  useEffect(() => {
    if (toolMetadata) {
      setFormData(null);
      setFormKey(prev => prev + 1);
    }
  }, [toolMetadata]);

  // Modify the handleRefreshJsonForm function
  const handleRefreshJsonForm = () => {
    // First trigger the refresh of the store's metadata from the editor
    onRefreshMetadata?.();
    
    try {
      // Try to stringify the metadata to ensure it is valid JSON
      JSON.stringify(toolMetadata);
      // First set formData to null
      setFormData(null);
      // Use setTimeout to ensure state updates happen in sequence
      setTimeout(() => {
        setFormKey(prev => prev + 1);
        toast.success('Metadata is valid and the form has been refreshed.');
      }, 0);
    } catch (e) {
      toast.error('The metadata is not valid JSON.');
    }
  };

  return (
    <div className="flex size-full min-h-[220px] flex-col rounded-lg bg-gray-300 pb-4 pl-4 pr-3">
      <div className="flex items-center justify-between">
        <div className="text-gray-80 flex flex-col gap-1 py-3 text-xs">
          <h2 className="flex font-mono font-semibold text-gray-50">Run</h2>
          {toolMetadata && <p>Fill in the options above to run your tool.</p>}
        </div>
        {isMetadataGenerationSuccess &&
          !isToolCodeGenerationPending &&
          !isMetadataGenerationError && (
            <div className="flex gap-2">
              <Button
                onClick={handleRefreshJsonForm}
                className="border-gray-200 text-white"
                rounded="lg"
                size="xs"
                variant="ghost"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh Form</span>
              </Button>
              <Button
                className="border-gray-200 text-white"
                form="parameters-form"
                isLoading={isExecutionToolCodePending}
                rounded="lg"
                size="xs"
                variant="ghost"
              >
                {!isExecutionToolCodePending && <Play className="h-4 w-4" />}
                Run
              </Button>
            </div>
          )}
      </div>
      <div className="flex-1 overflow-auto">
        {(isMetadataGenerationPending || isToolCodeGenerationPending) && (
          <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
            <Loader2 className="shrink-0 animate-spin" />
            Generating...
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
          !isToolCodeGenerationPending &&
          !isMetadataGenerationError && (
            <div className="text-gray-80 size-full text-xs">
              <JsonForm
                key={`form-${formKey}`}
                className={cn(
                  (toolMetadata?.configurations?.properties &&
                    Object.keys(toolMetadata.configurations.properties).length >
                      0) ||
                    (toolMetadata?.parameters?.properties &&
                      Object.keys(toolMetadata.parameters.properties).length >
                        0)
                    ? 'py-4'
                    : 'py-0',
                )}
                formData={formData}
                id="parameters-form"
                noHtml5Validate={true}
                onChange={(e) => setFormData(e.formData)}
                onSubmit={handleRunCode}
                schema={{
                  type: 'object',
                  properties: {
                    ...(toolMetadata?.configurations?.properties &&
                    Object.keys(toolMetadata.configurations.properties).length >
                      0
                      ? {
                          configs: toolMetadata.configurations,
                        }
                      : {}),
                    ...(toolMetadata?.parameters?.properties &&
                    Object.keys(toolMetadata.parameters.properties).length > 0
                      ? {
                          params: toolMetadata.parameters,
                        }
                      : {}),
                  },
                }}
                uiSchema={{
                  'ui:submitButtonOptions': { norender: true },
                  configs: {
                    'ui:title': 'Config',
                  },
                  params: {
                    'ui:title': 'Inputs',
                  },
                }}
                validator={validator}
              />
              <AnimatePresence>
                {(isExecutionToolCodePending ||
                  isExecutionToolCodeError ||
                  isExecutionToolCodeSuccess) && (
                  <motion.div
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col overflow-x-hidden bg-gray-300 pt-2"
                    exit={{ opacity: 0, x: 20 }}
                    initial={{ opacity: 0, x: 20 }}
                  >
                    {isExecutionToolCodePending && (
                      <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                        <Loader2 className="shrink-0 animate-spin" />
                        Running Tool...
                      </div>
                    )}
                    {isExecutionToolCodeError && (
                      <div className="mt-2 flex flex-col items-center gap-2 bg-red-900/20 px-3 py-4 text-xs text-red-400">
                        <p>
                          Tool execution failed. Try generating the tool code
                          again.
                        </p>
                        <pre className="whitespace-break-spaces px-4 text-center">
                          {executionToolCodeError}
                        </pre>
                      </div>
                    )}
                    <div>
                      {isExecutionToolCodeSuccess && toolResult && (
                        <ToolResult
                          mountTimestamp={mountTimestampRef.current}
                          toolResult={JSON.stringify(toolResult, null, 2)}
                          toolResultFiles={toolResultFiles}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        {isMetadataGenerationIdle && !isToolCodeGenerationPending && (
          <div>
            <p className="text-gray-80 py-4 pt-6 text-center text-xs">
              No metadata generated yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export const ExecutionPanel = memo(
  ExecutionPanelBase,
  (prevProps, nextProps) => {
    if (
      prevProps.isExecutionToolCodePending !==
      nextProps.isExecutionToolCodePending
    )
      return false;
    if (
      prevProps.isExecutionToolCodeError !== nextProps.isExecutionToolCodeError
    )
      return false;
    if (
      prevProps.isExecutionToolCodeSuccess !==
      nextProps.isExecutionToolCodeSuccess
    )
      return false;

    if (!equal(prevProps.toolResultFiles, nextProps.toolResultFiles))
      return false;

    return true;
  },
);

const logFileRegex = /log_app-id-\d+_task-id-\d+.log/;

function formatTimestamp(timestamp: string) {
  const year = timestamp.substring(0, 4);
  const month = timestamp.substring(4, 6);
  const day = timestamp.substring(6, 8);
  const hour = timestamp.substring(9, 11);
  const minute = timestamp.substring(11, 13);
  const second = timestamp.substring(13, 15);

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

const ToolResultBase = ({
  toolResultFiles,
  toolResult,
  mountTimestamp,
}: {
  toolResultFiles: string[];
  toolResult: string;
  mountTimestamp: Date;
}) => {
  const auth = useAuth((state) => state.auth);

  const logsFilePath = toolResultFiles.find((file) => logFileRegex.test(file));

  const [logsFile, setLogsFile] = useState<string | null>(null);

  const { data: logsFileBlob } = useGetShinkaiFileProtocol(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      file: logsFilePath ?? '',
    },
    {
      enabled: !!logsFilePath,
    },
  );

  useEffect(() => {
    if (logsFileBlob) {
      const handleLogsFile = async () => {
        const logsFile = new Blob([logsFileBlob], {
          type: 'text/plain',
        });
        const logsFileText = await logsFile.text();
        setLogsFile(logsFileText);
      };
      handleLogsFile();
    }
  }, [logsFileBlob]);

  function formatLogs(logString: string) {
    return logString
      .split('\n')
      .filter((line) => {
        if (/<\/?shinkai-code-result>/.test(line)) return false;

        const parts = line.split(',');
        if (parts.length < 5) return false;

        const timestamp = parts[0];
        const year = parseInt(timestamp.substring(0, 4));
        const month = parseInt(timestamp.substring(4, 6)) - 1;
        const day = parseInt(timestamp.substring(6, 8));
        const hour = parseInt(timestamp.substring(9, 11));
        const minute = parseInt(timestamp.substring(11, 13));
        const second = parseInt(timestamp.substring(13, 15));

        const logDate = new Date(year, month, day, hour, minute, second);
        return logDate >= mountTimestamp;
      })
      .map((line, i) => {
        const parts = line.split(',');
        const timestamp = parts[0];
        const logContent = parts.slice(4).join(',');
        const readableDate = formatTimestamp(timestamp);

        return (
          <div
            className="px-2 py-2 font-mono text-xs hover:bg-gray-500"
            key={i}
          >
            <span className="text-gray-100">{readableDate} </span>
            <span className="text-gray-50">{logContent}</span>
          </div>
        );
      });
  }

  return (
    <Tabs defaultValue="results">
      <TabsList className="h-[32px] w-full justify-start rounded-none border-b border-gray-200 bg-transparent">
        <TabsTrigger
          className="data-[state=active]:border-b-gray-80 min-w-[70px] rounded-none px-2.5 text-xs font-medium data-[state=active]:border-b-2 data-[state=active]:bg-transparent"
          value="results"
        >
          Output
        </TabsTrigger>
        <TabsTrigger
          className="data-[state=active]:border-b-gray-80 min-w-[70px] rounded-none px-2.5 text-xs font-medium data-[state=active]:border-b-2 data-[state=active]:bg-transparent"
          value="console"
        >
          Console
        </TabsTrigger>
      </TabsList>

      <TabsContent value="results">
        <div className="flex flex-col gap-4 px-2 py-2 pr-6">
          {toolResultFiles.length > 0 && (
            <div className="flex items-center gap-4">
              <h1 className="text-gray-80 shrink-0 text-xs font-medium">
                Generated Files
              </h1>
              <div className="flex w-full gap-2">
                {toolResultFiles
                  ?.filter((file) => !logFileRegex.test(file))
                  ?.map((file) => (
                    <ToolResultFileCard filePath={file} key={file} />
                  ))}
              </div>
            </div>
          )}
          <ToolCodeEditor language="json" readOnly value={toolResult} />
        </div>
      </TabsContent>

      <TabsContent value="console">
        <div className="rounded-md bg-gray-600 px-2 py-1 text-gray-50">
          {logsFile ? (
            <div className="space-y-1">
              <div className="text-gray-80 px-2 py-2">Console</div>
              {formatLogs(logsFile)}
            </div>
          ) : (
            <div className="text-gray-80 px-2 py-2">
              Results of your code will appear here when you run
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

const ToolResult = memo(ToolResultBase, (prevProps, nextProps) => {
  if (!equal(prevProps.toolResultFiles, nextProps.toolResultFiles))
    return false;
  if (prevProps.mountTimestamp !== nextProps.mountTimestamp) return false;
  if (prevProps.toolResult !== nextProps.toolResult) return false;
  return true;
});

function ToolResultFileCard({ filePath }: { filePath: string }) {
  const auth = useAuth((state) => state.auth);
  const { refetch } = useGetShinkaiFileProtocol(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      file: filePath,
    },
    {
      enabled: false,
    },
  );

  const fileNameBase =
    filePath.split('/')?.at(-1)?.split('.')?.at(0) ?? 'untitled_tool';
  const fileExtension = filePath.split('/')?.at(-1)?.split('.')?.at(-1) ?? '';

  return (
    <Button
      className="flex justify-start gap-2"
      onClick={async () => {
        const response = await refetch();
        const file = new Blob([response.data ?? ''], {
          type: 'application/octet-stream',
        });

        const arrayBuffer = await file.arrayBuffer();
        const content = new Uint8Array(arrayBuffer);

        const savePath = await save({
          defaultPath: `${fileNameBase}.${fileExtension}`,
          filters: [
            {
              name: 'File',
              extensions: [fileExtension],
            },
          ],
        });

        if (!savePath) {
          toast.info('File saving cancelled');
          return;
        }

        await fs.writeFile(savePath, content, {
          baseDir: BaseDirectory.Download,
        });

        toast.success(`${fileNameBase} downloaded successfully`);
      }}
      rounded="lg"
      size="xs"
      variant="outline"
    >
      <div className="flex shrink-0 items-center">
        {fileExtension && fileIconMap[fileExtension] ? (
          <FileTypeIcon
            className="text-gray-80 h-[18px] w-[18px] shrink-0"
            type={fileExtension}
          />
        ) : (
          <Paperclip className="text-gray-80 h-3.5 w-3.5 shrink-0" />
        )}
      </div>
      <div className="truncate text-left text-xs">
        {filePath.split('/')?.at(-1)}
      </div>
    </Button>
  );
}
