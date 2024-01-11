import { UndefinedInitialDataOptions } from '@tanstack/react-query/src/queryOptions';

export type GetHealthInput = {
  node_address: string;
};
export type GetHealthOutput = {
  is_pristine: boolean;
  node_name: string;
  status: string;
  version: string;
};

export type Options = UndefinedInitialDataOptions<GetHealthOutput>;
