import {
  DenoShinkaiTool,
  NetworkShinkaiTool,
  PythonShinkaiTool,
  RustShinkaiTool,
  ShinkaiTool,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useGetPlaygroundTools } from '@shinkai_network/shinkai-node-state/v2/queries/getPlaygroundTools/useGetPlaygroundTools';
import { useGetTool } from '@shinkai_network/shinkai-node-state/v2/queries/getTool/useGetTool';
import { Skeleton } from '@shinkai_network/shinkai-ui';
import { MoreVertical } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { SubpageLayout } from '../../pages/layout/simple-layout';
import { useAuth } from '../../store/auth';
import DenoTool from './deno-tool';
import NetworkTool from './network-tool';
import PythonTool from './python-tool';
import RustTool from './rust-tool';

export function isDenoShinkaiTool(tool: ShinkaiTool): tool is DenoShinkaiTool {
  return (tool as DenoShinkaiTool).js_code !== undefined;
}

export function isPythonShinkaiTool(
  tool: ShinkaiTool,
): tool is PythonShinkaiTool {
  return (tool as PythonShinkaiTool).py_code !== undefined;
}

export default function ToolDetails() {
  const auth = useAuth((state) => state.auth);

  const { toolKey } = useParams();

  const { data, isSuccess, isPending } = useGetTool({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    toolKey: toolKey ?? '',
  });

  const { data: playgroundTools } = useGetPlaygroundTools({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const tool = data?.content[0] as ShinkaiTool;
  const isEnabled = data?.content[1] as boolean;

  const toolType = data?.type;

  if (isPending) {
    return (
      <SubpageLayout alignLeft className="max-w-4xl" title="">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="bg-official-gray-900 h-16 w-16 rounded-md" />
            <div className="flex flex-col gap-2">
              <Skeleton className="bg-official-gray-900 h-7 w-64 rounded-md" />
              <Skeleton className="bg-official-gray-900 h-5 w-96 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="bg-official-gray-900 h-6 w-24 rounded-md" />{' '}
            <div className="flex h-8 w-8 items-center justify-center">
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="mb-8 border-b border-gray-500 pb-2">
          <div className="flex gap-2">
            <Skeleton className="bg-official-gray-900 h-6 w-20 rounded-md" />
            <Skeleton className="bg-official-gray-900 h-6 w-20 rounded-md" />
            <Skeleton className="bg-official-gray-900 h-6 w-32 rounded-md" />
          </div>
        </div>
        <div className="flex flex-col gap-6 px-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="bg-official-gray-900 h-5 w-32 rounded-md" />
            <Skeleton className="bg-official-gray-900 h-6 w-full max-w-2xl rounded-md" />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Skeleton className="bg-official-gray-900 h-5 w-24 rounded-md" />
            <Skeleton className="bg-official-gray-900 h-6 w-24 rounded-md" />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Skeleton className="bg-official-gray-900 h-5 w-20 rounded-md" />
            <Skeleton className="bg-official-gray-900 h-6 w-48 rounded-md" />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Skeleton className="bg-official-gray-900 h-5 w-24 rounded-md" />
            <Skeleton className="bg-official-gray-900 h-6 w-full max-w-xl rounded-md" />
          </div>
        </div>
      </SubpageLayout>
    );
  }

  if (isSuccess && toolType === 'Deno') {
    return (
      <DenoTool
        isEnabled={isEnabled}
        isPlaygroundTool={playgroundTools?.some(
          (playgroundTool) => playgroundTool.tool_router_key === toolKey,
        )}
        tool={tool as DenoShinkaiTool}
      />
    );
  } else if (isSuccess && toolType === 'Python') {
    return (
      <PythonTool
        isEnabled={isEnabled}
        isPlaygroundTool={playgroundTools?.some(
          (playgroundTool) => playgroundTool.tool_router_key === toolKey,
        )}
        tool={tool as PythonShinkaiTool}
      />
    );
  } else if (isSuccess && toolType === 'Rust') {
    return <RustTool isEnabled={isEnabled} tool={tool as RustShinkaiTool} />;
  } else if (isSuccess && toolType === 'Network') {
    return (
      <NetworkTool isEnabled={isEnabled} tool={tool as NetworkShinkaiTool} />
    );
  } else {
    return <div>Tool not found</div>;
  }
}
