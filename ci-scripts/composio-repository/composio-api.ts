interface AppCategory {
  id: string;
  name: string;
}

interface AppMeta {
  description: string;
  categories: AppCategory[];
  logo: string;
  tool_count: number;
}

interface App {
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

interface AuthField {
  name: string;
  displayName: string;
  type: string;
  description: string;
  required: boolean;
  default?: string;
}

interface AuthFields {
  auth_config_creation: {
    required: AuthField[];
    optional: AuthField[];
  };
  connected_account_initiation: {
    required: AuthField[];
    optional: AuthField[];
  };
}

interface AuthConfigDetail {
  name: string;
  mode: string;
  fields: AuthFields;
  proxy: {
    base_url: string;
  };
}

interface AppAction {
  name: string;
  description: string;
}

interface AppMetadata {
  totalDownloads: string;
  activeUsers: string;
  latestVersion: string;
  lastUpdated: string;
  tempDisabled: boolean;
}

interface AppDetailMeta {
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
    const response = await fetch('https://mcp.composio.dev/api/apps', {
      headers: {},
    });
    return response.json();
  }

  async getApp(appId: string): Promise<AppDetails> {
    const response = await fetch(`https://mcp.composio.dev/api/apps/${appId}`, {
      headers: {},
    });
    return response.json();
  }
}
