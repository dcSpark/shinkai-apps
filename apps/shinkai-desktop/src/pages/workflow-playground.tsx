import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';
import {
  CreateJobFormSchema,
  createJobFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/create-job';
import {
  VRFolder,
  VRItem,
} from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
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
import { useForm } from 'react-hook-form';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useSetJobScope } from '../components/chat/context/set-job-scope-context';
import { allowedFileExtensions } from '../lib/constants';
import { useAnalytics } from '../lib/posthog-provider';
import { ADD_AGENT_PATH } from '../routes/name';
import { useAuth } from '../store/auth';
import { useExperimental } from '../store/experimental';
import { useSettings } from '../store/settings';
import { SubpageLayout } from './layout/simple-layout';

const WorkflowPlayground = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const workflowHistory = useExperimental((state) => state.workflowHistory);
  const addWorkflowHistory = useExperimental(
    (state) => state.addWorkflowHistory,
  );
  const clearWorkflowHistory = useExperimental(
    (state) => state.clearWorkflowHistory,
  );
  const defaulAgentId = useSettings((state) => state.defaultAgentId);
  const navigate = useNavigate();
  const location = useLocation();
  const { captureAnalyticEvent } = useAnalytics();
  const [currentWorkflowIndex, setCurrentWorkflowIndex] = useState(-1);
  const [isTwoColumnLayout, setIsTwoColumnLayout] = useState(true);

  const locationState = location.state as {
    files: File[];
    agentName: string;
    selectedVRFiles: VRItem[];
    selectedVRFolders: VRFolder[];
  };

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

  // **Create the main job form**
  const createJobForm = useForm<CreateJobFormSchema>({
    resolver: zodResolver(createJobFormSchema),
    defaultValues: {
      files: [],
    },
  });

  const { llmProviders, isSuccess } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  useEffect(() => {
    if (isSuccess && llmProviders?.length && !defaulAgentId) {
      createJobForm.setValue('agent', llmProviders[0].id);
    } else {
      createJobForm.setValue('agent', defaulAgentId);
    }
  }, [llmProviders, createJobForm, defaulAgentId, isSuccess]);

  useEffect(() => {
    if (!locationState?.agentName) {
      return;
    }
    const agent = llmProviders.find(
      (agent) => agent.id === locationState.agentName,
    );
    if (agent) {
      createJobForm.setValue('agent', agent.id);
    }
  }, [createJobForm, locationState, llmProviders]);

  const { isPending, mutateAsync: createJob } = useCreateJob({
    onSuccess: (data, variables) => {
      navigate(
        `/workflow-playground/${encodeURIComponent(buildInboxIdFromJobId(data.jobId))}`,
      );

      addWorkflowHistory(variables.workflowCode as string);

      const files = variables?.files ?? [];
      const localFilesCount = (variables.selectedVRFiles ?? [])?.length;
      const localFoldersCount = (variables.selectedVRFolders ?? [])?.length;

      if (localFilesCount > 0 || localFoldersCount > 0) {
        captureAnalyticEvent('Ask Local Files', {
          foldersCount: localFoldersCount,
          filesCount: localFilesCount,
        });
      }
      if (files?.length > 0) {
        captureAnalyticEvent('AI Chat with Files', {
          filesCount: files.length,
        });
      } else {
        captureAnalyticEvent('AI Chat', undefined);
      }
    },
  });

  useEffect(() => {
    setCurrentWorkflowIndex(workflowHistory.size - 1);
  }, [workflowHistory.size]);

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

  const onWorkflowChange = useCallback(
    (value: string) => {
      createJobForm.setValue('workflow', value);
    },
    [createJobForm],
  );

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

        onWorkflowChange(newValue);

        // wait update before we can set the selection
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            selectionStart + (indent ?? '').length + 1;
        }, 0);
      }
    },
    [onWorkflowChange],
  );

  const [selectedTab, setSelectedTab] = useState<'workflow' | 'baml'>(
    'workflow',
  );
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  // **New State for BAML Script Selection and Data**
  const [selectedBamlScript, setSelectedBamlScript] = useState<
    'my' | 'extractResume' | 'classifyMessage'
  >('my');

  const [bamlFormData, setBamlFormData] = useState<{
    my: any;
    extractResume: any;
    classifyMessage: any;
  }>({
    my: {
      bamlInput: '',
      dslFile: '',
      functionName: '',
      paramName: '',
    },
    extractResume: {
      bamlInput: `John Doe
Education
- University of California, Berkeley
  - B.S. in Computer Science
  - 2020
Skills
- Python
- Java
- C++`,
      dslFile: `class Resume {
  name string
  education Education[] @description("Extract in the same order listed")
  skills string[] @description("Only include programming languages")
}

class Education {
  school string
  degree string
  year int
}

function ExtractResume(resume_text: string) -> Resume {
  client ShinkaiProvider

  // The prompt uses Jinja syntax. Change the models or this text and watch the prompt preview change!
  prompt #"
    Parse the following resume and return a structured representation of the data in the schema below.

    Resume:
    ---
    {{ resume_text }}
    ---

    {# special macro to print the output instructions. #}
    {{ ctx.output_format }}

    JSON:
  "#
}`,
      functionName: 'ExtractResume',
      paramName: 'resume_text',
    },
    classifyMessage: {
      bamlInput: `Classify the following message into categories.`,
      dslFile: `class Message {
  text string
  category string
}

function ClassifyMessage(message_text: string) -> Message {
  client ShinkaiProvider

  prompt #"
    Classify the following message into appropriate categories.

    Message:
    ---
    {{ message_text }}
    ---

    JSON:
  "#
}`,
      functionName: 'ClassifyMessage',
      paramName: 'message_text',
    },
  });

  // **Define the BAML Form**
  const bamlForm = useForm({
    defaultValues: bamlFormData[selectedBamlScript],
  });

  // **Handle BAML Script Selection**
  const handleBamlScriptChange = (script: 'my' | 'extractResume' | 'classifyMessage') => {
    // Save current form data
    setBamlFormData((prevData) => ({
      ...prevData,
      [selectedBamlScript]: bamlForm.getValues(),
    }));

    // Switch to the selected script
    setSelectedBamlScript(script);

    // Load the new form data
    bamlForm.reset(bamlFormData[script]);
  };

  // **Update form data on change**
  useEffect(() => {
    setBamlFormData((prevData) => ({
      ...prevData,
      [selectedBamlScript]: bamlForm.getValues(),
    }));
  }, [bamlForm, selectedBamlScript]);

  const escapeContent = (content: string) => {
    return content.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  };

  const onBamlSubmit = async (data: any) => {
    const { bamlInput, dslFile, functionName, paramName } = data;
    const escapedBamlInput = escapeContent(bamlInput);
    const escapedDslFile = escapeContent(dslFile);
    const workflowText = `
      workflow ${functionName} v0.1 {
        step Initialize {
          $DSL = "${escapedDslFile}"
          $INPUT = "${escapedBamlInput}"
          $PARAM = "${paramName}"
          $FUNCTION = "${functionName}"
          $RESULT = call baml_inference($INPUT, "", "", $DSL, $FUNCTION, $PARAM)
        }
      } @@localhost.arb-sep-shinkai
    `;
    console.log('Generated Workflow:', workflowText);

    if (!auth) return;

    await createJob({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      llmProvider: defaulAgentId,
      content: escapedBamlInput,
      files: [],
      workflowCode: workflowText,
      isHidden: true,
      selectedVRFiles: [],
      selectedVRFolders: [],
    });

    // Save the form data after submission
    setBamlFormData((prevData) => ({
      ...prevData,
      [selectedBamlScript]: data,
    }));
  };

  return (
    <SubpageLayout
      className="max-w-[auto] px-3"
      title={t('workflowPlayground.label')}
    >
      <div className="flex h-[calc(100vh_-_150px)] gap-6 overflow-hidden">
        {/* Left Sidebar */}
        <div className="flex w-[50%] flex-col gap-4">
          <Select
            onValueChange={(value) =>
              setSelectedTab(value as 'workflow' | 'baml')
            }
            value={selectedTab}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Tab" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workflow">Workflow</SelectItem>
              <SelectItem value="baml">BAML</SelectItem>
            </SelectContent>
          </Select>

          {/* Main Content Area */}
          <div className="flex-1">
            {selectedTab === 'workflow' && (
              <Form {...createJobForm}>
                <form
                  className="space-y-8 overflow-y-auto pr-2"
                  onSubmit={createJobForm.handleSubmit(onSubmit)}
                >
                  <div className="space-y-6">
                    <FormField
                      control={createJobForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('chat.form.message')}</FormLabel>
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
                              className="!min-h-[300px] resize-vertical text-sm"
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
                                    currentWorkflowIndex >=
                                    workflowHistory.size - 1
                                  }
                                  onClick={() => {
                                    if (
                                      currentWorkflowIndex <
                                      workflowHistory.size - 1
                                    ) {
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
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t('chat.form.selectAI')}
                                />
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
                              <p className="text-sm text-white">
                                Local AI Files
                              </p>
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
                                <FormLabel className="sr-only">
                                  Upload a file
                                </FormLabel>
                                <FormControl>
                                  <FileUploader
                                    accept={allowedFileExtensions.join(',')}
                                    allowMultiple
                                    descriptionText={allowedFileExtensions?.join(
                                      ' | ',
                                    )}
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
                    disabled={isPending}
                    isLoading={isPending}
                    size="sm"
                    type="submit"
                  >
                    Try Workflow
                  </Button>
                </form>
              </Form>
            )}
            {selectedTab === 'baml' && (
              <div className="space-y-8 overflow-y-auto pr-2 max-h-[calc(100vh_-_200px)]">
                {/* BAML Script Selection Buttons */}
                <div className="flex items-center gap-4">
                  {/* My BAML Script Button */}
                  <Button
                    className="text-sm py-1.5 px-3"
                    onClick={() => handleBamlScriptChange('my')}
                    variant={selectedBamlScript === 'my' ? 'default' : 'outline'}
                  >
                    My BAML Script
                  </Button>

                  {/* Examples Text */}
                  <span className="text-white text-lg">Examples:</span>

                  {/* Extract Resume Button */}
                  <Button
                    className="text-sm py-1.5 px-3"
                    onClick={() => handleBamlScriptChange('extractResume')}
                    variant={
                      selectedBamlScript === 'extractResume' ? 'default' : 'outline'
                    }
                  >
                    Extract Resume
                  </Button>

                  {/* Classify Message Button */}
                  <Button
                    className="text-sm py-1.5 px-3"
                    onClick={() => handleBamlScriptChange('classifyMessage')}
                    variant={
                      selectedBamlScript === 'classifyMessage' ? 'default' : 'outline'
                    }
                  >
                    Classify Message
                  </Button>
                </div>

                {/* Layout Switch Button */}
                <Button
                  className="text-sm py-1.5 px-3"
                  onClick={() => setIsTwoColumnLayout(!isTwoColumnLayout)}
                  variant="outline"
                >
                  Switch Layout
                </Button>

                {/* BAML Form */}
                <Form {...bamlForm}>
                  <form
                    className="space-y-8"
                    onSubmit={bamlForm.handleSubmit(onBamlSubmit)}
                  >
                    {isTwoColumnLayout ? (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={bamlForm.control}
                          name="bamlInput"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>BAML Input</FormLabel>
                              <FormControl>
                                <Textarea
                                  className="resize-vertical min-h-[160px]"
                                  placeholder="Enter BAML input"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bamlForm.control}
                          name="dslFile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>DSL File</FormLabel>
                              <FormControl>
                                <Textarea
                                  className="resize-vertical min-h-[160px]"
                                  placeholder="Enter DSL file content"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <>
                        <FormField
                          control={bamlForm.control}
                          name="bamlInput"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>BAML Input</FormLabel>
                              <FormControl>
                                <Textarea
                                  className="resize-vertical"
                                  placeholder="Enter BAML input"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bamlForm.control}
                          name="dslFile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>DSL File</FormLabel>
                              <FormControl>
                                <Textarea
                                  className="resize-vertical"
                                  placeholder="Enter DSL file content"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={bamlForm.control}
                        name="functionName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Function Name</FormLabel>
                            <FormControl>
                              <Textarea
                                className="resize-vertical"
                                placeholder="Enter function name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={bamlForm.control}
                        name="paramName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Param Name</FormLabel>
                            <FormControl>
                              <Textarea
                                className="resize-vertical"
                                placeholder="Enter param name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button className="w-full" size="sm" type="submit">
                      Submit BAML
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Content (Outlet) */}
        <div className="flex h-full flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </SubpageLayout>
  );
};
export default WorkflowPlayground;
