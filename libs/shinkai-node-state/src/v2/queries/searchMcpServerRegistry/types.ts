export interface MCPRegistryServer {
  qualifiedName: string;
  displayName: string;
  description: string;
  createdAt: string;
  useCount: number;
  homepage: string;
}

export interface MCPRegistryPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface SearchMcpServerRegistryResponse {
  servers: MCPRegistryServer[];
  pagination: MCPRegistryPagination;
}

export interface SearchMcpServerRegistryInput {
  query: string;
  page?: number;
  pageSize?: number;
}
