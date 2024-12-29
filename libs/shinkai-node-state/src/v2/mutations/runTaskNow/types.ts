export interface RunTaskNowInput {
  nodeAddress: string;
  token: string;
  taskId: string;
}

export interface RunTaskNowOutput {
  success: boolean;
  message: string;
}
