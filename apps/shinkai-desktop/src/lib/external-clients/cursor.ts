import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth'; // Adjust path as needed

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
    console.error('Automatic Cursor configuration failed:', error);
    let errorMessage = 'Automatic configuration failed.';
    if (typeof error === 'string') {
      errorMessage += ` Error: ${error}`;
    } else if (error instanceof Error) {
      errorMessage += ` Error: ${error.message}`;
    }

    try {
      const helpText = await invoke<string>('get_cursor_sse_config_help', {
        serverId: serverId,
        url: sseUrl,
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
      console.error('Failed to fetch Cursor config help text:', helpError);
      toast.error(errorMessage, {
        id: loadingToastId,
        description: 'Could not retrieve manual setup instructions.',
      });
    }
  }
}; 