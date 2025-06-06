export interface ComposioApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  version?: string;
  author?: string;
  license?: string;
  repository?: string;
  features?: string[];
  requirements?: string[];
} 