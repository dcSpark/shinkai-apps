export type SetCommonToolsetConfigInput = {
  nodeAddress: string;
  token: string;
  tool_set_key: string;
  value: Record<string, unknown>;
};

export type SetCommonToolsetConfigOutput = {
  updated_tool_keys: string[];
};
