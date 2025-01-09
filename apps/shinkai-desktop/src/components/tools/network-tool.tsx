import { NetworkShinkaiTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';

import ToolCard from './components/tool-card';

export default function NetworkTool({
  tool,
  isEnabled,
}: {
  tool: NetworkShinkaiTool;
  isEnabled: boolean;
}) {
  return <ToolCard isEnabled={isEnabled} tool={tool} toolType="Network" />;
}
