export type CheckHealthResponse = {
  status: 'ok';
  node_name: string;
  is_pristine: boolean;
  version: string;
};
