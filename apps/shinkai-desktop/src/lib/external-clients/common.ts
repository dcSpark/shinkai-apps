import { invoke } from '@tauri-apps/api/core';

// Custom error type for configuration failures needing manual steps
export class ConfigError extends Error {
  helpText: string;
  constructor(message: string, helpText: string) {
    super(message);
    this.name = 'ConfigError';
    this.helpText = helpText;
  }
}

interface ShinkaiNodeOptions {
  shinkai_tools_runner_deno_binary_path?: string;
  // other options...
}

export const getDenoBinPath = async (): Promise<string> => {
  try {
    const options = await invoke<ShinkaiNodeOptions>('shinkai_node_get_options');
    const denoPath = options?.shinkai_tools_runner_deno_binary_path;
    if (!denoPath) {
      console.warn('Deno binary path not found in options, defaulting to "deno"');
      return 'deno'; // Default or fallback
    }
    return denoPath;
  } catch (error) {
    console.error('Failed to get Shinkai node options for Deno path:', error);
    console.warn('Falling back to default "deno" path');
    return 'deno'; // Default or fallback in case of error
  }
};