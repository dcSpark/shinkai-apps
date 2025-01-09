import { RustShinkaiTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';

import ToolCard from './components/tool-card';

export default function RustTool({
  tool,
  isEnabled,
}: {
  tool: RustShinkaiTool;
  isEnabled: boolean;
}) {
  return <ToolCard isEnabled={isEnabled} tool={tool} toolType="Rust" />;
}
