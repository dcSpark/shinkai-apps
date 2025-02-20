import { NetworkShinkaiTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';

import ToolDetailsCard from './components/tool-details-card';

export default function NetworkTool({
  tool,
  isEnabled,
}: {
  tool: NetworkShinkaiTool;
  isEnabled: boolean;
}) {
  return (
    <ToolDetailsCard isEnabled={isEnabled} tool={tool} toolType="Network" />
  );
}
