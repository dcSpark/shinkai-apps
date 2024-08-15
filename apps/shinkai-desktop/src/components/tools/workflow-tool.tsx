import { WorkflowShinkaiTool } from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
import { Switch } from '@shinkai_network/shinkai-ui';

import { formatWorkflowName } from '../../pages/create-job';
import { SubpageLayout } from '../../pages/layout/simple-layout';

export default function WorkflowTool({
  tool,
  isEnabled,
}: {
  tool: WorkflowShinkaiTool;
  isEnabled: boolean;
}) {
  return (
    <SubpageLayout alignLeft title={formatWorkflowName(tool.workflow.name)}>
      <div className="flex flex-col">
        <div className="mb-4 flex items-center justify-between gap-1">
          <p className="text-sm text-white">Enabled</p>
          <Switch checked={isEnabled} />
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
          },
          {
            label: 'Version',
            value: tool.workflow.version,
          },
        ].map(({ label, value }) => (
          <div className="flex flex-col gap-1 py-4" key={label}>
            <span className="text-gray-80 text-xs">{label}</span>
            <span className="text-sm text-white">{value}</span>
            {/*<Textarea*/}
            {/*  className="!min-h-[100px] resize-none pl-2 pt-2 text-sm placeholder-transparent"*/}
            {/*  placeholder={'Enter prompt or a formula...'}*/}
            {/*  readOnly*/}
            {/*  spellCheck={false}*/}
            {/*  value={value ?? ' '}*/}
            {/*/>*/}
          </div>
        ))}
      </div>
    </SubpageLayout>
  );
}
