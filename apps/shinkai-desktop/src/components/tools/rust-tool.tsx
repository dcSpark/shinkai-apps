import {
  RustShinkaiTool,
  ShinkaiTool,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useUpdateTool } from '@shinkai_network/shinkai-node-state/v2/mutations/updateTool/useUpdateTool';
import { Switch } from '@shinkai_network/shinkai-ui';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { SubpageLayout } from '../../pages/layout/simple-layout';
import { useAuth } from '../../store/auth';
import RemoveToolButton from '../playground-tool/components/remove-tool-button';

export default function RustTool({
  tool,
  isEnabled,
}: {
  tool: RustShinkaiTool;
  isEnabled: boolean;
}) {
  const auth = useAuth((state) => state.auth);

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
  const { toolKey } = useParams();

  return (
    <SubpageLayout alignLeft title={formatText(tool.name)}>
      <div className="flex flex-col">
        <div className="mb-4 flex items-center justify-between gap-1">
          <p className="text-sm text-white">Enabled</p>
          <Switch
            checked={isEnabled}
            onCheckedChange={async () => {
              await updateTool({
                toolKey: toolKey ?? '',
                toolType: 'Rust',
                toolPayload: {} as ShinkaiTool,
                isToolEnabled: !isEnabled,
                nodeAddress: auth?.node_address ?? '',
                token: auth?.api_v2_key ?? '',
              });
            }}
          />
        </div>
        {[
          {
            label: 'Description',
            value: tool.description,
          },
        ]
          .filter((item) => !!item)
          .map(({ label, value }) => (
            <div className="flex flex-col gap-1 py-4" key={label}>
              <span className="text-gray-80 text-xs">{label}</span>
              <span className="text-sm text-white">{value}</span>
            </div>
          ))}

        <div className="flex flex-col gap-4 py-6">
          <RemoveToolButton toolKey={toolKey as string} />
        </div>
      </div>
    </SubpageLayout>
  );
}
