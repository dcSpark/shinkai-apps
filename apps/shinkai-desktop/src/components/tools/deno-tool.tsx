import { DenoShinkaiTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';

import ToolCard from './components/tool-card';

export default function DenoTool({
  tool,
  isEnabled,
  isPlaygroundTool,
}: {
  tool: DenoShinkaiTool;
  isEnabled: boolean;
  isPlaygroundTool?: boolean;
}) {
  return (
    <ToolCard
      isEnabled={isEnabled}
      isPlaygroundTool={isPlaygroundTool}
      tool={tool}
      toolType="Deno"
    />
  );
}
