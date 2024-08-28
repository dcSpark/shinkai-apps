import {
  JSShinkaiTool,
  ShinkaiTool,
  WorkflowShinkaiTool,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useGetTool } from '@shinkai_network/shinkai-node-state/v2/queries/getTool/useGetTool';
import { Skeleton } from '@shinkai_network/shinkai-ui';
import { useParams } from 'react-router-dom';

import { SubpageLayout } from '../../pages/layout/simple-layout';
import { useAuth } from '../../store/auth';
import JsTool from './js-tool';
import WorkflowTool from './workflow-tool';

function isWorkflowShinkaiTool(tool: ShinkaiTool): tool is WorkflowShinkaiTool {
  return (tool as WorkflowShinkaiTool).workflow !== undefined;
}

function isJSShinkaiTool(tool: ShinkaiTool): tool is JSShinkaiTool {
  return (tool as JSShinkaiTool).js_code !== undefined;
}

export default function ToolDetails() {
  const auth = useAuth((state) => state.auth);

  const { toolKey } = useParams();

  const { data, isSuccess, isPending } = useGetTool({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    toolKey: toolKey ?? '',
  });

  const tool = data?.content[0] as ShinkaiTool;
  const isEnabled = data?.content[1] as boolean;

  if (isPending) {
    return (
      <SubpageLayout
        alignLeft
        title={<Skeleton className="h-6 w-40 rounded-md bg-gray-300" />}
      >
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32 rounded-md bg-gray-300" />
            <Skeleton className="h-6 w-16 rounded-md bg-gray-300" />
          </div>
          <Skeleton className="h-20 w-full shrink-0 rounded-md bg-gray-300" />
          <Skeleton className="h-20 w-full shrink-0 rounded-md bg-gray-300" />
          <Skeleton className="h-20 w-full shrink-0 rounded-md bg-gray-300" />
          <Skeleton className="h-20 w-full shrink-0 rounded-md bg-gray-300" />
        </div>
      </SubpageLayout>
    );
  }

  if (isSuccess && isWorkflowShinkaiTool(tool)) {
    return <WorkflowTool isEnabled={isEnabled} tool={tool} />;
  } else if (isSuccess && isJSShinkaiTool(tool)) {
    return <JsTool isEnabled={isEnabled} tool={tool} />;
  } else {
    return <div>Tool not found</div>;
  }
}
