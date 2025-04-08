import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth'; // Adjust path as needed
import { ConfigError, getDenoBinPath } from './common'; // Import from common.ts

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
  const nodeUrl = auth?.node_address || 'http://localhost:9550'; // Use the correct port if different
  const loadingToastId = toast.loading('Attempting automatic Claude Desktop configuration...');

  try {
    const denoBinPath = await getDenoBinPath();
    const command = denoBinPath;
    const args = ['run', '-A', 'npm:supergateway', '--sse', `${nodeUrl}/mcp/sse`];

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
    toast.dismiss(loadingToastId);
    console.error('Automatic Claude Desktop configuration failed:', error);
    let errorMessage = 'Automatic configuration failed.';
    if (typeof error === 'string') {
      errorMessage += ` Error: ${error}`;
    } else if (error instanceof Error) {
      errorMessage += ` Error: ${error.message}`;
    }

    let helpText: string | null = null; // Declare helpText here
    try {
      // Attempt to fetch help text with updated command/args
      const command = 'npx';
      const args = ['-y','supergateway', '--sse', `${nodeUrl}/mcp/sse`];
      helpText = await invoke<string>('get_claude_config_help', {
        serverId: serverId,
        binaryPath: command,
        serverArgs: args,
      });
      // Do not throw ConfigError here
    } catch (helpError) {
      console.error('Failed to fetch Claude config help text:', helpError);
      // Throw regular error if fetching help text fails
      throw new Error(`${errorMessage} Could not retrieve manual setup instructions.`);
    }

    // If helpText was successfully fetched in the try block above, throw ConfigError now.
    // The null check ensures we don't proceed if helpText wasn't assigned.
    if (helpText) {
      throw new ConfigError(errorMessage, helpText);
    } else {
       // This case should theoretically not be reached if the catch above throws,
       // but added for robustness. If helpText is null here, something went wrong
       // without an exception being caught by the inner catch.
       throw new Error(`${errorMessage} Could not retrieve manual setup instructions (unexpected state).`);
    }
  }
};
