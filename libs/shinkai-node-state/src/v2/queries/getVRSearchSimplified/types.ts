export type GetVRSearchSimplifiedInput = {
  nodeAddress: string;
  token: string;
  path?: string;
  search: string;
};

export type SearchResult = [string, string[], number];
export type GetVRSearchSimplifiedOutput = SearchResult[];
