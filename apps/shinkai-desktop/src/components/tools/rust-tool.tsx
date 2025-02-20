import { RustShinkaiTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';

import ToolDetailsCard from './components/tool-details-card';

export default function RustTool({
  tool,
  isEnabled,
}: {
  tool: RustShinkaiTool;
  isEnabled: boolean;
}) {
  return <ToolDetailsCard isEnabled={isEnabled} tool={tool} toolType="Rust" />;
}
