import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';
import {
  CreateJobFormSchema,
  createJobFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/create-job';
import {
  Badge,
  Button,
  FileUploader,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  AISearchContentIcon,
  FilesIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { MoveLeft, MoveRight, PlusIcon, TrashIcon } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { allowedFileExtensions } from '../../lib/constants';
import { useAnalytics } from '../../lib/posthog-provider';
import { ADD_AGENT_PATH } from '../../routes/name';
import { useExperimental } from '../../store/experimental';
import { useSetJobScope } from '../chat/context/set-job-scope-context';

interface WorkflowFormProps {
  createJobForm: any;
  createJob: any;
  auth: any;
  llmProviders: any[];
  defaulAgentId: string;
}

const WorkflowForm: React.FC<WorkflowFormProps> = ({
  createJobForm,
  createJob,
  auth,
  llmProviders,
  defaulAgentId,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { captureAnalyticEvent } = useAnalytics();

  const workflowHistory = useExperimental((state) => state.workflowHistory);
  const addWorkflowHistory = useExperimental(
    (state) => state.addWorkflowHistory,
  );
  const clearWorkflowHistory = useExperimental(
    (state) => state.clearWorkflowHistory,
  );

  const setSetJobScopeOpen = useSetJobScope(
    (state) => state.setSetJobScopeOpen,
  );

  const setKnowledgeSearchOpen = useSetJobScope(
    (state) => state.setKnowledgeSearchOpen,
  );

  const selectedKeys = useSetJobScope((state) => state.selectedKeys);

  const selectedFileKeysRef = useSetJobScope(
    (state) => state.selectedFileKeysRef,
  );
  const selectedFolderKeysRef = useSetJobScope(
    (state) => state.selectedFolderKeysRef,
  );

  const [currentWorkflowIndex, setCurrentWorkflowIndex] = useState(-1);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  const locationState = location.state as {
    files: File[];
    agentName: string;
    selectedVRFiles: any[];
    selectedVRFolders: any[];
  };

  const handleWorkflowKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();

        const textarea = e.currentTarget;
        const { selectionStart, selectionEnd } = textarea;
        const currentValue = textarea.value;

        const lineStart =
          currentValue.lastIndexOf('\n', selectionStart - 1) + 1;
        const lineEnd = currentValue.indexOf('\n', selectionStart);
        const currentLine = currentValue.substring(
          lineStart,
          lineEnd === -1 ? currentValue.length : lineEnd,
        );
        const indent = currentLine?.match(/^\s*/)?.[0];

        const newValue =
          currentValue.substring(0, selectionStart) +
          '\n' +
          indent +
          currentValue.substring(selectionEnd);

        createJobForm.setValue('workflow', newValue);

        // wait update before we can set the selection
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            selectionStart + (indent ?? '').length + 1;
        }, 0);
      }
    },
    [createJobForm],
  );

  const [selectedWorkflowScript, setSelectedWorkflowScript] = useState<
    'custom' | 'summarizer' | 'example2'
  >('custom');

  const [workflowFormData, setWorkflowFormData] = useState<{
    custom: {
      message: string;
      workflow: string;
      agent: string;
      files: File[];
    };
    summarizer: {
      message: string;
      workflow: string;
      agent: string;
      files: File[];
    };
    example2: {
      message: string;
      workflow: string;
      agent: string;
      files: File[];
    };
  }>({
    custom: {
      message: '',
      workflow: '',
      agent: '',
      files: [],
    },
    summarizer: {
      message: 'Example message 1',
      workflow: `workflow Extensive_summary v0.1 {
                step Initialize {
                    $PROMPT = "Summarize this: "
                    $EMBEDDINGS = call process_embeddings_in_job_scope()
                }
                step Summarize {
                    $RESULT = call multi_inference($PROMPT, $EMBEDDINGS)
                }
            } @@official.shinkai`,
      agent: '',
      files: [],
    },
    example2: {
      message: 'Example message 2',
      workflow: 'Example workflow 2',
      agent: '',
      files: [],
    },
  });

  const handleWorkflowScriptChange = useCallback(
    (script: 'custom' | 'summarizer' | 'example2') => {
      const currentValues = createJobForm.getValues();

      // Save current form data
      setWorkflowFormData((prevData) => {
        const updatedData = {
          ...prevData,
          [selectedWorkflowScript]: {
            message: currentValues.message || '',
            workflow: currentValues.workflow || '',
            agent: currentValues.agent || '',
            files: currentValues.files || [],
          },
        };
        return updatedData;
      });

      // Switch to the selected script
      setSelectedWorkflowScript(script);

      // Load the new form data
      createJobForm.reset(workflowFormData[script]);
    },
    [createJobForm, workflowFormData, selectedWorkflowScript],
  );

  // useEffect(() => {
  //   const subscription = createJobForm.watch((values: CreateJobFormSchema) => {
  //     setWorkflowFormData((prevData) => ({
  //       ...prevData,
  //       [selectedWorkflowScript]: values,
  //     }));
  //   });
  //   return () => subscription.unsubscribe();
  // }, [createJobForm, selectedWorkflowScript]);

  const onSubmit = async (data: CreateJobFormSchema) => {
    if (!auth) return;
    const selectedVRFiles =
      selectedFileKeysRef.size > 0
        ? Array.from(selectedFileKeysRef.values())
        : [];
    const selectedVRFolders =
      selectedFolderKeysRef.size > 0
        ? Array.from(selectedFolderKeysRef.values())
        : [];

    await createJob({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      llmProvider: data.agent,
      content: data.message,
      files: data.files,
      workflowCode: data.workflow,
      isHidden: true,
      selectedVRFiles,
      selectedVRFolders,
    });
  };

  const handleWorkflowSave = () => {
    // Implement save functionality
    console.log('Save Workflow Script');
  };

  const handleWorkflowLoad = () => {
    // Implement load functionality
    console.log('Load Workflow Script');
  };

  return (
    <Form {...createJobForm}>
      <form
        className="space-y-8 overflow-y-auto pr-2 max-h-[calc(100vh-100px)]"
        onSubmit={createJobForm.handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          {/* Workflow Script Selection Buttons */}
          <div className="flex items-center gap-4">
            {/* Custom Workflow Script Button */}
            <Button
              className="px-3 py-1.5 text-sm"
              onClick={() => handleWorkflowScriptChange('custom')}
              variant={
                selectedWorkflowScript === 'custom' ? 'default' : 'outline'
              }
            >
              Custom Workflow Script
            </Button>

            {/* Examples Text */}
            <span className="text-lg text-white">Examples:</span>

            {/* Summarizer Button */}
            <Button
              className="px-3 py-1.5 text-sm"
              onClick={() => handleWorkflowScriptChange('summarizer')}
              variant={
                selectedWorkflowScript === 'summarizer' ? 'default' : 'outline'
              }
            >
              Summarizer
            </Button>

            {/* Example 2 Button */}
            <Button
              className="px-3 py-1.5 text-sm"
              onClick={() => handleWorkflowScriptChange('example2')}
              variant={
                selectedWorkflowScript === 'example2' ? 'default' : 'outline'
              }
            >
              Example 2
            </Button>

            {/* Save and Load Buttons */}
            {selectedWorkflowScript === 'custom' && (
              <div className="ml-auto flex gap-2">
                <Button
                  className="px-3 py-1.5 text-sm"
                  onClick={handleWorkflowSave}
                  variant="outline"
                >
                  Save
                </Button>
                <Button
                  className="px-3 py-1.5 text-sm"
                  onClick={handleWorkflowLoad}
                  variant="outline"
                >
                  Load
                </Button>
              </div>
            )}
          </div>

          <FormField
            control={createJobForm.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Message:</FormLabel>
                <FormControl>
                  <Textarea
                    autoFocus={true}
                    className="resize-vertical"
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' &&
                        (event.metaKey || event.ctrlKey)
                      ) {
                        createJobForm.handleSubmit(onSubmit)();
                      }
                    }}
                    placeholder={t('chat.form.messagePlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={createJobForm.control}
            name="workflow"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>{t('chat.form.workflows')}</FormLabel>
                <FormControl>
                  <Textarea
                    autoFocus={true}
                    className="resize-vertical !min-h-[300px] text-sm"
                    onKeyDown={handleWorkflowKeyDown}
                    placeholder="Workflow"
                    spellCheck={false}
                    {...field}
                  />
                </FormControl>
                {Array.from(workflowHistory).length > 0 && (
                  <>
                    <div className="absolute right-3 top-3 flex items-center gap-2">
                      <Button
                        className="h-6 w-6"
                        disabled={currentWorkflowIndex <= 0}
                        onClick={() => {
                          if (currentWorkflowIndex > 0) {
                            setCurrentWorkflowIndex(
                              (prevIndex) => prevIndex - 1,
                            );
                            createJobForm.setValue(
                              'workflow',
                              Array.from(workflowHistory)[
                                currentWorkflowIndex - 1
                              ],
                            );
                          }
                        }}
                        size="icon"
                        type="button"
                        variant="outline"
                      >
                        <MoveLeft className="h-3 w-3" />
                      </Button>

                      <Button
                        className="h-6 w-6"
                        disabled={
                          currentWorkflowIndex >= workflowHistory.size - 1
                        }
                        onClick={() => {
                          if (currentWorkflowIndex < workflowHistory.size - 1) {
                            setCurrentWorkflowIndex(
                              (prevIndex) => prevIndex + 1,
                            );
                            createJobForm.setValue(
                              'workflow',
                              Array.from(workflowHistory)[
                                currentWorkflowIndex + 1
                              ],
                            );
                          }
                        }}
                        size="icon"
                        type="button"
                        variant="outline"
                      >
                        <MoveRight className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <Button
                        className="h-6 w-6"
                        onClick={() => {
                          setCurrentWorkflowIndex(-1);
                          createJobForm.setValue('workflow', '');
                          clearWorkflowHistory();
                        }}
                        size="icon"
                        type="button"
                        variant="outline"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={createJobForm.control}
            name="agent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('chat.form.selectAI')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('chat.form.selectAI')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {llmProviders?.length ? (
                      llmProviders.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          <span>{agent.id} </span>
                        </SelectItem>
                      ))
                    ) : (
                      <Button
                        onClick={() => {
                          navigate(ADD_AGENT_PATH);
                        }}
                        variant="ghost"
                      >
                        <PlusIcon className="mr-2" />
                        {t('llmProviders.add')}
                      </Button>
                    )}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <Button
            className="hover:bg-gray-350 flex h-[40px] items-center justify-between gap-2 rounded-lg p-2.5 text-left"
            onClick={() => setIsContextMenuOpen(!isContextMenuOpen)}
            size="auto"
            type="button"
            variant="outline"
          >
            <div className="flex items-center gap-2">
              <FilesIcon className="h-4 w-4" />
              <p className="text-sm text-white">Set Chat Context</p>
            </div>
          </Button>

          {isContextMenuOpen && (
            <div className="my-3 rounded-md bg-gray-400 px-3 py-4">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-medium text-gray-100">
                    {t('chat.form.setContext')}
                  </h2>
                  <p className="text-gray-80 text-xs">
                    {t('chat.form.setContextText')}
                  </p>
                </div>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="flex h-10 w-10 items-center justify-center gap-2 rounded-lg p-2.5 text-left hover:bg-gray-500"
                        onClick={() => setKnowledgeSearchOpen(true)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <AISearchContentIcon className="h-5 w-5" />
                        <p className="sr-only text-xs text-white">
                          AI Files Content Search
                        </p>
                      </Button>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent sideOffset={0}>
                        Search AI Files Content
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="mt-2 flex flex-col gap-1.5">
                <Button
                  className="hover:bg-gray-350 flex h-[40px] items-center justify-between gap-2 rounded-lg p-2.5 text-left"
                  onClick={() => setSetJobScopeOpen(true)}
                  size="auto"
                  type="button"
                  variant="outline"
                >
                  <div className="flex items-center gap-2">
                    <FilesIcon className="h-4 w-4" />
                    <p className="text-sm text-white">Local AI Files</p>
                  </div>
                  {Object.keys(selectedKeys ?? {}).length > 0 && (
                    <Badge className="bg-brand text-white">
                      {Object.keys(selectedKeys ?? {}).length}
                    </Badge>
                  )}
                </Button>
                <FormField
                  control={createJobForm.control}
                  name="files"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Upload a file</FormLabel>
                      <FormControl>
                        <FileUploader
                          accept={allowedFileExtensions.join(',')}
                          allowMultiple
                          descriptionText={allowedFileExtensions?.join(' | ')}
                          onChange={(acceptedFiles) => {
                            field.onChange(acceptedFiles);
                          }}
                          shouldDisableScrolling
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>
        <Button
          className="w-full"
          // disabled={isPending}
          // isLoading={isPending}
          size="sm"
          type="submit"
        >
          Try Workflow
        </Button>
      </form>
    </Form>
  );
};

export default WorkflowForm;
