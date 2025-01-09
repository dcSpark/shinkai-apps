import { PythonShinkaiTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';

import ToolCard from './components/tool-card';

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
    <ToolCard
      isEnabled={isEnabled}
      isPlaygroundTool={isPlaygroundTool}
      tool={tool}
      toolType="Python"
    />
  );
}
