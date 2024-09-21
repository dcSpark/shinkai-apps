
// import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';

// import { CreateJobFormSchema, createJobFormSchema } from '@shinkai_network/shinkai-node-state/forms/chat/create-job';
// import {
//   VRFolder,
//   VRItem,
// } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
// import { DEFAULT_CHAT_CONFIG } from '@shinkai_network/shinkai-node-state/v2/constants';
// import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
// import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
// import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
// import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';

// import { MoveLeft, MoveRight, PlusIcon, TrashIcon } from 'lucide-react';
// import React, { useCallback, useEffect, useState } from 'react';
// previous code
// WorkflowPlayground.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  CreateJobFormSchema,
  createJobFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/create-job';
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
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useSetJobScope } from '../components/chat/context/set-job-scope-context';
import BamlForm from '../components/playground/BamlForm';
import WorkflowForm from '../components/playground/WorkflowForm';
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
  const defaulAgentId = useSettings((state) => state.defaultAgentId);
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState<'workflow' | 'baml'>('baml');

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

  const { mutateAsync: createJob } = useCreateJob({
    onSuccess: (data, variables) => {
      navigate(`/workflow-playground/${encodeURIComponent(data.jobId)}`);
    },
  });

  return (
    <SubpageLayout
      className="max-w-[auto] px-3"
      title={t('workflowPlayground.label')}
    >
      <div className="flex h-[calc(100vh_-_150px)] gap-6 overflow-hidden">
        {/* Left Sidebar */}
        <div className="flex w-[60%] flex-col gap-4">
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
              <WorkflowForm
                auth={auth}
                createJob={createJob}
                createJobForm={createJobForm}
                defaulAgentId={defaulAgentId}
                llmProviders={llmProviders}
              />
            )}
            {selectedTab === 'baml' && (
              <BamlForm
                auth={auth}
                createJob={createJob}
                defaulAgentId={defaulAgentId}
              />
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
