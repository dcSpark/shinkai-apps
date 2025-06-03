import { type CheckHealthResponse } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type QueryObserverOptions } from '@tanstack/react-query';

import { type FunctionKeyV2 } from '../../constants';

export type GetHealthInput = {
  nodeAddress: string;
};
export type UseGetHealth = [FunctionKeyV2.GET_HEALTH, GetHealthInput];
export type GetHealthOutput = CheckHealthResponse;

export type Options = QueryObserverOptions<
  GetHealthOutput,
  Error,
  GetHealthOutput,
  GetHealthOutput,
  UseGetHealth
>;
