import { transformDataToTreeNodes } from '@shinkai_network/shinkai-node-state/lib/utils/files';
import { useGetListDirectoryContents } from '@shinkai_network/shinkai-node-state/v2/queries/getDirectoryContents/useGetListDirectoryContents';
import { useGetDownloadFile } from '@shinkai_network/shinkai-node-state/v2/queries/getDownloadFile/useGetDownloadFile';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ScrollArea,
  Tabs,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ChevronsRight } from 'lucide-react';
import { Tree } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import { PrismEditor } from 'prism-react-editor';
import { Fragment, useEffect, useRef, useState } from 'react';

import { treeOptions } from '../../lib/constants';
import { useAuth } from '../../store/auth';
import ToolCodeEditor from '../playground-tool/tool-code-editor';
import { useChatStore } from './context/chat-context';

const FileExplorer = () => {
  const auth = useAuth((state) => state.auth);
  const artifact = useChatStore((state) => state.selectedArtifact);
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [fileContent, setFileContent] = useState<string>('');
  const textFileContentRef = useRef<PrismEditor | null>(null);

  const setFileExplorerOpen = useChatStore(
    (state) => state.setFileExplorerOpen,
  );

  const { data: fileInfoArray, isSuccess: isVRFilesSuccess } =
    useGetListDirectoryContents({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      path: '/',
    });

  useEffect(() => {
    if (isVRFilesSuccess) {
      setNodes(transformDataToTreeNodes(fileInfoArray));
    }
  }, [fileInfoArray, isVRFilesSuccess]);

  const { mutateAsync: downloadFile } = useGetDownloadFile({});

  useEffect(() => {
    const fetchFileContent = async () => {
      if (selectedKey && auth) {
        try {
          const fileContentBase64 = await downloadFile({
            nodeAddress: auth.node_address,
            token: auth.api_v2_key,
            path: selectedKey,
          });
          const binaryString = atob(fileContentBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const fileContent = new TextDecoder('utf-8').decode(bytes);
          setFileContent(fileContent);
        } catch (error) {
          console.error('Error downloading file content:', error);
        }
      }
    };

    fetchFileContent();
  }, [selectedKey, auth, downloadFile]);

  return (
    <TooltipProvider delayDuration={0}>
      <Tabs
        className="flex h-screen w-full flex-col overflow-hidden"
        defaultValue="preview"
      >
        <div className={'flex h-screen flex-grow justify-stretch py-3'}>
          <div className="flex size-full flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="text-gray-80 flex h-[30px] items-center gap-2 rounded-md text-xs"
                      onClick={() => {
                        setFileExplorerOpen(false);
                      }}
                      size="auto"
                      variant="tertiary"
                    >
                      <ChevronsRight className="h-4 w-4" />
                      <span className="">File Explorer</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent className="flex flex-col items-center gap-1">
                      <p>Close File Explorer Panel</p>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
                <h1 className="line-clamp-1 text-sm font-medium text-white">
                  {artifact?.title}
                </h1>
              </div>
            </div>

            <div className="h-full overflow-y-scroll whitespace-pre-line break-words">
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                  className="flex h-full flex-col"
                  defaultSize={32}
                  maxSize={50}
                  minSize={20}
                >
                  <div className="flex h-8 items-center justify-between gap-3 px-2">
                    <h2 className="text-gray-80 text-xs">Files</h2>
                  </div>
                  <ScrollArea className="h-[calc(100vh-200px)] flex-1 px-2">
                    <Tree
                      onSelectionChange={(e) => {
                        const isFile = (e.value as string)?.includes('.');
                        if (isFile) {
                          setSelectedKey(e.value as string);
                          return;
                        }
                      }}
                      pt={treeOptions}
                      selectionKeys={selectedKey}
                      selectionMode="single"
                      value={nodes}
                    />
                  </ScrollArea>
                </ResizablePanel>
                <ResizableHandle className="bg-gray-300" />
                <ResizablePanel className="flex h-full flex-col">
                  {selectedKey && (
                    <Breadcrumb className="h-8 border-b p-2">
                      <BreadcrumbList className="text-xs">
                        {selectedKey?.split('/').map((item) => (
                          <Fragment key={item}>
                            <BreadcrumbItem>
                              <BreadcrumbLink
                                className={cn(
                                  item === selectedKey.split('/').at(-1)
                                    ? 'text-gray-50'
                                    : 'text-gray-80',
                                )}
                              >
                                {item}
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            {item === selectedKey.split('/').at(-1) ? null : (
                              <BreadcrumbSeparator />
                            )}
                          </Fragment>
                        ))}
                      </BreadcrumbList>
                    </Breadcrumb>
                  )}
                  <div className="flex flex-1 flex-col space-y-2 overflow-hidden">
                    <ToolCodeEditor
                      language="txt"
                      ref={textFileContentRef}
                      value={fileContent ?? ''}
                    />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </div>
      </Tabs>
    </TooltipProvider>
  );
};
export default FileExplorer;
