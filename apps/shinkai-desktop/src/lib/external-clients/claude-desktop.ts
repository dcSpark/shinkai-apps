import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth'; // Adjust path as needed

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

export const handleConfigureClaude = async (serverId: string) => {
  const auth = useAuth.getState().auth;
  const nodeUrl = auth?.node_address || 'http://localhost:9950';
  const command = 'npx'; // Command to run the server
  const args = ['-y', 'supergateway', '--sse', `${nodeUrl}/mcp/sse`];
  const loadingToastId = toast.loading('Attempting automatic Claude Desktop configuration...');

  try {
    await invoke('register_server_in_claude', {
      serverId: serverId,
      binaryPath: command,
      serverArgs: args,
    });
    toast.success('Claude Desktop configured successfully!', {
      id: loadingToastId,
      description: 'Please restart Claude for the changes to take effect.',
    });
  } catch (error) {
    console.error('Automatic Claude Desktop configuration failed:', error);
    let errorMessage = 'Automatic configuration failed.';
    if (typeof error === 'string') {
      errorMessage += ` Error: ${error}`;
    } else if (error instanceof Error) {
      errorMessage += ` Error: ${error.message}`;
    }

    try {
      const helpText = await invoke<string>('get_claude_config_help', {
        serverId: serverId,
        binaryPath: command,
        serverArgs: args,
      });
      toast.error(errorMessage, {
        id: loadingToastId,
        description: helpText,
        duration: 20000,
        action: {
          label: 'Copy Instructions',
          onClick: () => {
            navigator.clipboard.writeText(helpText);
            toast.info('Manual instructions copied to clipboard');
          },
        },
      });
    } catch (helpError) {
      console.error('Failed to fetch Claude config help text:', helpError);
      toast.error(errorMessage, {
        id: loadingToastId,
        description: 'Could not retrieve manual setup instructions.',
      });
    }
  }
};
