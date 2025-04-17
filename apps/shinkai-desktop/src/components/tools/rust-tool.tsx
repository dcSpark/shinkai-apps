import { RustShinkaiTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';

import ToolDetailsCard from './components/tool-details-card';

export default function RustTool({
  tool,
  isEnabled,
  toolRouterKey,
}: {
  tool: RustShinkaiTool;
  isEnabled: boolean;
  toolRouterKey: string;
}) {
  return (
    <ToolDetailsCard
      isEnabled={isEnabled}
      tool={tool}
      toolKey={toolRouterKey}
      toolType="Rust"
    />
  );
}
