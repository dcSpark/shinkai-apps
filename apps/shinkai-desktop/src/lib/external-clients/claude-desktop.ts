import { toast } from 'sonner';

export interface McpServerConfig {
  command: string;
  args: string[];
}

export const getClaudeDesktopConfigPath = (): string => {
  const platform = window.navigator.platform.toLowerCase();
  
  if (platform.includes('win')) {
    return '%APPDATA%\\Claude\\claude_desktop_config.json';
  } else if (platform.includes('mac')) {
    return '~/Library/Application Support/Claude/claude_desktop_config.json';
  } else {
    return '~/.config/Claude/claude_desktop_config.json';
  }
};

export const displayClaudeDesktopInstructions = (serverName: string, config: McpServerConfig) => {
  const configPath = getClaudeDesktopConfigPath();
  const configJson = JSON.stringify(
    {
      mcpServers: {
        [serverName]: config
      }
    }, 
    null, 
    2
  );
  
  const instructions = `
Add to your Claude Desktop configuration (${configPath}):

\`\`\`json
${configJson}
\`\`\`

If the file doesn't exist, create it with this content.
If it exists, merge this configuration with existing content.
`;
  
  toast.success('Claude Desktop Configuration', {
    description: instructions,
    duration: 10000,
    action: {
      label: 'Copy',
      onClick: () => {
        navigator.clipboard.writeText(configJson);
        toast.success('Configuration copied to clipboard');
      }
    }
  });
};
