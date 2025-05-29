import { McpServerTool as McpServerToolType } from '@shinkai_network/shinkai-message-ts/api/tools/types';

import ToolDetailsCard from './components/tool-details-card';

interface McpServerToolProps {
  tool: McpServerToolType;
  toolRouterKey: string;
  isEnabled: boolean;
  isPlaygroundTool?: boolean;
}

export default function McpServerTool({
  tool,
  toolRouterKey,
  isEnabled,
  isPlaygroundTool,
}: McpServerToolProps) {
  return (
    <>
      <ToolDetailsCard
        hideToolHeaderDetails={false}
        isEnabled={isEnabled}
        isPlaygroundTool={isPlaygroundTool}
        tool={tool}
        toolKey={toolRouterKey}
        toolType="MCPServer"
      />
    </>
  );
}
