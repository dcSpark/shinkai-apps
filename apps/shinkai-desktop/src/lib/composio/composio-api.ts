import { fetch } from '@tauri-apps/plugin-http';
export interface AppCategory {
  id: string;
  name: string;
}

export interface AppMeta {
  description: string;
  categories: AppCategory[];
  logo: string;
  tool_count: number;
}

export interface App {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  isActive: boolean;
  status: string;
  usageCount: number;
  integrations: string[];
  platform: string[];
  popular: boolean;
  popularityMetric: number;
  enabled: boolean;
  meta: AppMeta;
}

export interface AuthField {
  name: string;
  displayName: string;
  type: string;
  description: string;
  required: boolean;
  default?: string;
}

export interface AuthFields {
  auth_config_creation: {
    required: AuthField[];
    optional: AuthField[];
  };
  connected_account_initiation: {
    required: AuthField[];
    optional: AuthField[];
  };
}

export interface AuthConfigDetail {
  name: string;
  mode: string;
  fields: AuthFields;
  proxy: {
    base_url: string;
  };
}

export interface AppAction {
  name: string;
  description: string;
}

export interface AppMetadata {
  totalDownloads: string;
  activeUsers: string;
  latestVersion: string;
  lastUpdated: string;
  tempDisabled: boolean;
}

export interface AppDetailMeta {
  created_at: string;
  updated_at: string;
  description: string;
  logo: string;
  app_url: string;
  categories: {
    name: string;
    slug: string;
  }[];
  triggers_count: number;
  tools_count: number;
}

export interface AppDetails {
  name: string;
  slug: string;
  enabled: boolean;
  composio_managed_auth_schemes: string[];
  auth_config_details: AuthConfigDetail[];
  is_local_toolkit: boolean;
  meta: AppDetailMeta;
  actions: AppAction[];
  sseUrl: string;
  typescriptCode: string;
  pythonCode: string;
  metadata: AppMetadata;
  key: string;
}

export class ComposioApi {
  async getApps(): Promise<App[]> {
    console.log("Getting apps");
    const response = await fetch("https://mcp.composio.dev/api/apps", {
    });
    console.log(response);
    return response.json();
  }

  async getApp(appId: string): Promise<AppDetails> {
    const response = await fetch(`https://mcp.composio.dev/api/apps/${appId}`, {
    });
    return response.json();
  }

  async generateClientId(appId: string): Promise<string> {
    console.log("generating client id for app", appId);
    const response = await fetch(`https://mcp.composio.dev/${appId}`, {
    });
    const url = new URL(response.url);
    const customerId = url.searchParams.get('customerId') || '';
    return customerId;
  }

  async getAppForClientId(appId: string, clientId: string): Promise<AppDetails> {
    console.log("getting app for client id", appId, clientId);
    const response = await fetch(`https://mcp.composio.dev/api/apps/${appId}?uuid=${clientId}`, {
    });
    return response.json();
  }
}
