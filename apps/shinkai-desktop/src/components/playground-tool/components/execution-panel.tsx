import { FormProps } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { useGetShinkaiFileProtocol } from '@shinkai_network/shinkai-node-state/v2/queries/getShinkaiFileProtocol/useGetShinkaiFileProtocol';
import {
  Button,
  CommandShortcut,
  JsonForm,
  Skeleton,
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
import { AppWindow, LoaderIcon, Paperclip, TerminalIcon } from 'lucide-react';
import { memo, MutableRefObject, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../../store/auth';
import { usePlaygroundStore } from '../context/playground-context';
import { ToolErrorFallback } from '../error-boundary';
import ToolCodeEditor from '../tool-code-editor';
import { tabTriggerClassnames } from './tool-playground';

function ExecutionPanelBase({
  isExecutionToolCodeSuccess,
  isExecutionToolCodeError,
  isExecutionToolCodePending,
  executionToolCodeError,
  mountTimestampRef,
  toolResultFiles,
  handleRunCode,
  regenerateToolMetadata,
}: {
  isExecutionToolCodeSuccess: boolean;
  isExecutionToolCodeError: boolean;
  isExecutionToolCodePending: boolean;
  executionToolCodeError?: string;
  mountTimestampRef: MutableRefObject<Date>;
  toolResultFiles: string[];
  handleRunCode: FormProps['onSubmit'];
  regenerateToolMetadata: () => void;
}) {
  const viewTabRef = useRef<HTMLDivElement>(null);
  const consoleTabRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState(null);

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
  const focusedPanel = usePlaygroundStore((state) => state.focusedPanel);
  const setFocusedPanel = usePlaygroundStore((state) => state.setFocusedPanel);

  const isMetadataGenerationIdle = toolMetadataStatus === 'idle';
  const isMetadataGenerationSuccess = toolMetadataStatus === 'success';
  const isMetadataGenerationError = toolMetadataStatus === 'error';
  const isMetadataGenerationPending = toolMetadataStatus === 'pending';

  useEffect(() => {
    if (
      isExecutionToolCodeSuccess ||
      isExecutionToolCodeError ||
      isExecutionToolCodePending
    ) {
      setTimeout(() => {
        viewTabRef.current?.scrollTo({
          top: viewTabRef.current?.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [
    isExecutionToolCodeSuccess,
    isExecutionToolCodeError,
    isExecutionToolCodePending,
  ]);

  return (
    <Tabs className="flex size-full flex-col" defaultValue="view">
      <div className="bg-official-gray-1000 flex w-full shrink-0 items-center justify-between gap-2 border-b border-gray-500">
        <TabsList className="grid h-8 grid-cols-2 rounded-none bg-transparent p-0">
          <TabsTrigger
            className={cn(tabTriggerClassnames)}
            data-focused={focusedPanel === 'preview'}
            onClick={() => setFocusedPanel('preview')}
            value="view"
          >
            <div className="flex size-full items-center justify-start gap-2 border-r border-gray-400 pl-3 pr-5 text-xs font-normal">
              {isExecutionToolCodePending || isMetadataGenerationPending ? (
                <LoaderIcon className="size-4 animate-spin" />
              ) : (
                <AppWindow className="size-4 text-inherit" />
              )}
              Preview
            </div>
          </TabsTrigger>
          <TabsTrigger
            className={cn(tabTriggerClassnames)}
            data-focused={focusedPanel === 'console'}
            onClick={() => {
              setFocusedPanel('console');

              if (consoleTabRef.current) {
                consoleTabRef.current.scrollTo({
                  top: consoleTabRef.current.scrollHeight,
                  behavior: 'smooth',
                });
              }
            }}
            value="console"
          >
            <div className="flex size-full items-center justify-start gap-2 border-r border-gray-400 pl-3 pr-5 text-xs font-normal">
              <TerminalIcon className="size-4 text-inherit" />
              Console
            </div>
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent
        className="mt-0 flex-1 overflow-auto whitespace-pre-line break-words"
        onBlur={() => setFocusedPanel(null)}
        onFocus={() => setFocusedPanel('preview')}
        ref={viewTabRef}
        value="view"
      >
        <div className="flex size-full flex-col pb-4 pl-4 pr-3">
          <div className="flex items-start justify-between gap-8 py-3">
            <div className="text-gray-80 flex items-center gap-1 text-xs">
              {isMetadataGenerationSuccess &&
                !isToolCodeGenerationPending &&
                !isMetadataGenerationError &&
                toolMetadata && (
                  <div className="flex flex-col gap-1">
                    <h1 className="text-base font-medium text-white">
                      {toolMetadata.name}
                    </h1>
                    <p className="text-official-gray-400 text-xs">
                      {toolMetadata.description}
                    </p>
                  </div>
                )}
            </div>
            {isMetadataGenerationSuccess &&
              !isToolCodeGenerationPending &&
              !isMetadataGenerationError && (
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
                  Run
                  <CommandShortcut className="font-clash flex items-center text-xs text-white">
                    ⌘⏎
                  </CommandShortcut>
                </Button>
              )}
          </div>
          <div className="pb-6">
            {(isMetadataGenerationPending || isToolCodeGenerationPending) && (
              <div className="text-gray-80 flex w-full flex-col items-start gap-5 text-xs">
                <div className="w-full space-y-2">
                  <Skeleton className="bg-official-gray-900 h-6 w-2/4 animate-pulse rounded" />
                  <Skeleton className="bg-official-gray-900 h-10 w-3/4 animate-pulse rounded" />
                </div>
                <div className="w-full space-y-3">
                  <Skeleton className="bg-official-gray-900 h-4 w-1/4 animate-pulse rounded" />
                  <Skeleton className="bg-official-gray-900 h-8 w-full animate-pulse rounded" />
                  <Skeleton className="bg-official-gray-900 h-4 w-1/4 animate-pulse rounded" />
                  <Skeleton className="bg-official-gray-900 h-10 w-full animate-pulse rounded" />
                </div>
                <p className="sr-only">Generating Metadata...</p>
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
                    className={cn(
                      (toolMetadata?.configurations?.properties &&
                        Object.keys(toolMetadata.configurations.properties)
                          .length > 0) ||
                        (toolMetadata?.parameters?.properties &&
                          Object.keys(toolMetadata.parameters.properties)
                            .length > 0)
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
                        Object.keys(toolMetadata.configurations.properties)
                          .length > 0
                          ? {
                              configs: toolMetadata.configurations,
                            }
                          : {}),
                        ...(toolMetadata?.parameters?.properties &&
                        Object.keys(toolMetadata.parameters.properties).length >
                          0
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

                  <AnimatePresence mode="popLayout">
                    {(isExecutionToolCodePending ||
                      isExecutionToolCodeError ||
                      isExecutionToolCodeSuccess) && (
                      <motion.div
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col pt-2"
                        exit={{ opacity: 0, x: 20 }}
                        initial={{ opacity: 0, x: 20 }}
                      >
                        {isExecutionToolCodePending && (
                          <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
                            <LoaderIcon className="shrink-0 animate-spin" />
                            Running Tool...
                          </div>
                        )}
                        {isExecutionToolCodeError && (
                          <div className="mt-2 flex flex-col items-center gap-2 bg-red-900/20 px-3 py-4 text-xs text-red-400">
                            <p>
                              Tool execution failed. Try generating the tool
                              code again.
                            </p>
                            <pre className="whitespace-break-spaces px-4 text-center">
                              {executionToolCodeError}
                            </pre>
                          </div>
                        )}
                        <div>
                          {isExecutionToolCodeSuccess && toolResult && (
                            <ToolResult
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
      </TabsContent>
      <TabsContent
        className="mt-0 h-full overflow-y-auto whitespace-pre-line break-words"
        onBlur={() => setFocusedPanel(null)}
        onFocus={() => {
          setFocusedPanel('console');
        }}
        ref={consoleTabRef}
        value="console"
      >
        <ToolLogs
          mountTimestamp={mountTimestampRef.current}
          toolResultFiles={toolResultFiles}
        />
      </TabsContent>
    </Tabs>
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

    if (prevProps.handleRunCode !== nextProps.handleRunCode) return false;

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
}: {
  toolResultFiles: string[];
  toolResult: string;
}) => {
  return (
    <div className="flex flex-col gap-4 pb-6">
      {toolResultFiles.length > 0 && (
        <>
          <h5 className="text-xs uppercase text-gray-50">Output</h5>
          <div className="flex items-center gap-4">
            <h1 className="text-gray-80 shrink-0 text-xs font-medium">
              Generated Files
            </h1>
            <div className="flex w-full gap-2">
              {toolResultFiles?.map((file) => (
                <ToolResultFileCard filePath={file} key={file} />
              ))}
            </div>
          </div>
        </>
      )}
      <ToolCodeEditor language="json" readOnly value={toolResult} />
    </div>
  );
};

const ToolResult = memo(ToolResultBase, (prevProps, nextProps) => {
  if (!equal(prevProps.toolResultFiles, nextProps.toolResultFiles))
    return false;
  if (prevProps.toolResult !== nextProps.toolResult) return false;
  return true;
});

const ToolLogsBase = ({
  toolResultFiles,
  mountTimestamp,
}: {
  toolResultFiles: string[];
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
    <div className="bg-official-gray-950 rounded-md px-2 py-1 text-gray-50">
      {logsFile ? (
        <div className="space-y-1">{formatLogs(logsFile)}</div>
      ) : (
        <div className="text-gray-80 px-2 py-2 text-left text-xs">
          Results of your code will appear here when you run
        </div>
      )}
    </div>
  );
};

const ToolLogs = memo(ToolLogsBase, (prevProps, nextProps) => {
  if (!equal(prevProps.toolResultFiles, nextProps.toolResultFiles))
    return false;
  if (prevProps.mountTimestamp !== nextProps.mountTimestamp) return false;
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
