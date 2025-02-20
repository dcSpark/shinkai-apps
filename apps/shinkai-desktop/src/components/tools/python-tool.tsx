import { PythonShinkaiTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';

import ToolDetailsCard from './components/tool-details-card';

export default function PythonTool({
  tool,
  isEnabled,
  isPlaygroundTool,
}: {
  tool: PythonShinkaiTool;
  isEnabled: boolean;
  isPlaygroundTool?: boolean;
}) {
  return (
    <ToolDetailsCard
      isEnabled={isEnabled}
      isPlaygroundTool={isPlaygroundTool}
      tool={tool}
      toolType="Python"
    />
  );
}
