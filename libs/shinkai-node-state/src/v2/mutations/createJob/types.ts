export type CreateJobInput = {
  nodeAddress: string;
  llmProvider: string;
  sheetId: string;
  content: string;
  isHidden: boolean;
  workflowName?: string;
  workflowCode?: string;
};

export type CreateJobOutput = {
  jobId: string;
};
