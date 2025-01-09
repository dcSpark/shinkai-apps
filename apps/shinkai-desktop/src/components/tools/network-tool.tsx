import {
  NetworkShinkaiTool,
  ShinkaiTool,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useExportTool } from '@shinkai_network/shinkai-node-state/v2/mutations/exportTool/useExportTool';
import { useUpdateTool } from '@shinkai_network/shinkai-node-state/v2/mutations/updateTool/useUpdateTool';
import { Button, Switch } from '@shinkai_network/shinkai-ui';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { save } from '@tauri-apps/plugin-dialog';
import * as fs from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
import { DownloadIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { SubpageLayout } from '../../pages/layout/simple-layout';
import { useAuth } from '../../store/auth';
import RemoveToolButton from '../playground-tool/components/remove-tool-button';

export default function NetworkTool({
  tool,
  isEnabled,
}: {
  tool: NetworkShinkaiTool;
  isEnabled: boolean;
}) {
  const auth = useAuth((state) => state.auth);
  const { toolKey } = useParams();

  const { mutateAsync: updateTool } = useUpdateTool({
    onSuccess: (_, variables) => {
      if (
        'config' in variables.toolPayload &&
        variables.toolPayload.config?.length > 0
      ) {
        toast.success('Tool configuration updated successfully');
      }
    },
  });
  const { mutateAsync: exportTool, isPending: isExportingTool } = useExportTool(
    {
      onSuccess: async (response, variables) => {
        const toolName = variables.toolKey.split(':::')?.[1] ?? 'untitled_tool';
        const file = new Blob([response ?? ''], {
          type: 'application/octet-stream',
        });

        const arrayBuffer = await file.arrayBuffer();
        const content = new Uint8Array(arrayBuffer);

        const savePath = await save({
          defaultPath: `${toolName}.zip`,
          filters: [
            {
              name: 'Zip File',
              extensions: ['zip'],
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

        toast.success('Tool exported successfully');
      },
      onError: (error) => {
        toast.error('Failed to export tool', {
          description: error.response?.data?.message ?? error.message,
        });
      },
    },
  );

  return (
    <SubpageLayout alignLeft title={formatText(tool.name)}>
      <Button
        className="absolute right-0 top-9 flex h-[30px] items-center gap-2 rounded-lg bg-gray-500 text-xs"
        disabled={isExportingTool}
        isLoading={isExportingTool}
        onClick={() => {
          exportTool({
            toolKey: toolKey ?? '',
            nodeAddress: auth?.node_address ?? '',
            token: auth?.api_v2_key ?? '',
          });
        }}
        size="sm"
        variant="outline"
      >
        <DownloadIcon className="h-4 w-4" />
        Export
      </Button>
      <div className="flex flex-col">
        <div className="mb-4 flex items-center justify-between gap-1">
          <p className="text-sm text-white">Enabled</p>
          <Switch
            checked={isEnabled}
            onCheckedChange={async () => {
              await updateTool({
                toolKey: toolKey ?? '',
                toolType: 'Network',
                toolPayload: {} as ShinkaiTool,
                isToolEnabled: !isEnabled,
                nodeAddress: auth?.node_address ?? '',
                token: auth?.api_v2_key ?? '',
              });
            }}
          />
        </div>
        <div className="flex flex-col gap-4 py-6">
          <RemoveToolButton toolKey={toolKey as string} />
        </div>
      </div>
    </SubpageLayout>
  );
}
