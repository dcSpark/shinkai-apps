import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';

export type GetHealthInput = {
  node_address: string;
};
export type UseGetHealth = [FunctionKey.GET_HEALTH, GetHealthInput];
export type GetHealthOutput = {
  is_pristine: boolean;
  node_name: string;
  status: string;
  version: string;
};

export type Options = QueryObserverOptions<
  GetHealthOutput,
  Error,
  GetHealthOutput,
  GetHealthOutput,
  UseGetHealth
>;
