import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth'; // Adjust path as needed
import { ConfigError } from './common'; // Import from common.ts

export const handleConfigureCursor = async (serverId: string) => {
  const auth = useAuth.getState().auth;
  const nodeUrl = auth?.node_address || 'http://localhost:9950';
  const sseUrl = `${nodeUrl}/mcp/sse`;
  const loadingToastId = toast.loading('Attempting automatic Cursor configuration...');

  try {
    await invoke('register_sse_server_in_cursor', {
      serverId: serverId,
      url: sseUrl,
    });
    toast.success('Cursor configured successfully!', {
      id: loadingToastId,
      description: 'Please restart Cursor for the changes to take effect.',
    });
  } catch (error) {
    toast.dismiss(loadingToastId);
    console.error('Automatic Cursor configuration failed:', error);
    let errorMessage = 'Automatic configuration failed.';
    if (typeof error === 'string') {
      errorMessage += ` Error: ${error}`;
    } else if (error instanceof Error) {
      errorMessage += ` Error: ${error.message}`;
    }

    let helpText: string | null = null; // Declare helpText here
    try {
      helpText = await invoke<string>('get_cursor_sse_config_help', {
        serverId: serverId,
        url: sseUrl,
      });
      // Do not throw ConfigError here
    } catch (helpError) {
      console.error('Failed to fetch Cursor config help text:', helpError);
      // Throw regular error if fetching help text fails
      throw new Error(`${errorMessage} Could not retrieve manual setup instructions.`);
    }

    // If helpText was successfully fetched in the try block above, throw ConfigError now.
    if (helpText) {
      throw new ConfigError(errorMessage, helpText);
    } else {
      // Added for robustness, similar to claude-desktop.ts
      throw new Error(`${errorMessage} Could not retrieve manual setup instructions (unexpected state).`);
    }
  }
}; 