import {
  ShinkaiTool,
  WorkflowShinkaiTool,
} from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
import { useUpdateTool } from '@shinkai_network/shinkai-node-state/lib/mutations/updateTool/useUpdateTool';
import { Switch, Textarea } from '@shinkai_network/shinkai-ui';
import { useParams } from 'react-router-dom';

import { formatText } from '../../pages/create-job';
import { SubpageLayout } from '../../pages/layout/simple-layout';
import { useAuth } from '../../store/auth';

export default function WorkflowTool({
  tool,
  isEnabled,
}: {
  tool: WorkflowShinkaiTool;
  isEnabled: boolean;
}) {
  const auth = useAuth((state) => state.auth);

  const { mutateAsync: updateTool } = useUpdateTool();
  const { toolKey } = useParams();

  return (
    <SubpageLayout alignLeft title={formatText(tool.workflow.name)}>
      <div className="flex flex-col">
        <div className="mb-4 flex items-center justify-between gap-1">
          <p className="text-sm text-white">Enabled</p>
          <Switch
            checked={isEnabled}
            onCheckedChange={async () => {
              await updateTool({
                toolKey: toolKey ?? '',
                toolType: 'Workflow',
                toolPayload: {} as ShinkaiTool,
                isToolEnabled: !isEnabled,
                nodeAddress: auth?.node_address ?? '',
                shinkaiIdentity: auth?.shinkai_identity ?? '',
                profile: auth?.profile ?? '',
                my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
                my_device_identity_sk: auth?.my_device_identity_sk ?? '',
                node_encryption_pk: auth?.node_encryption_pk ?? '',
                profile_encryption_sk: auth?.profile_encryption_sk ?? '',
                profile_identity_sk: auth?.profile_identity_sk ?? '',
              });
            }}
          />
        </div>
        {[
          {
            label: 'Description',
            value: tool.workflow.description,
          },
          {
            label: 'Author',
            value: tool.workflow.author,
          },
          {
            label: 'Workflow Raw',
            value: tool.workflow.raw,
            isCode: true,
          },
          {
            label: 'Version',
            value: tool.workflow.version,
          },
        ].map(({ label, value, isCode }) => (
          <div className="flex flex-col gap-1 py-4" key={label}>
            <span className="text-gray-80 text-xs">{label}</span>
            {isCode ? (
              <Textarea
                className="!min-h-[100px] resize-none pl-2 pt-2 text-sm placeholder-transparent"
                placeholder={'Enter prompt or a formula...'}
                readOnly
                spellCheck={false}
                value={value ?? ' '}
              />
            ) : (
              <span className="text-sm text-white">{value}</span>
            )}
          </div>
        ))}
      </div>
    </SubpageLayout>
  );
}
