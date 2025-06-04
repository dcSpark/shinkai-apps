import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type NgrokStatusResponse } from '@shinkai_network/shinkai-message-ts/api/ngrok';
import { type QueryObserverOptions } from '@tanstack/react-query';
import { type FunctionKeyV2 } from '../../constants';

export type GetNgrokStatusInput = Token & {
  nodeAddress: string;
};
export type UseGetNgrokStatus = [
  FunctionKeyV2.GET_NGROK_STATUS,
  GetNgrokStatusInput,
];
export type GetNgrokStatusOutput = NgrokStatusResponse;

export type Options = QueryObserverOptions<
  GetNgrokStatusOutput,
  Error,
  GetNgrokStatusOutput,
  GetNgrokStatusOutput,
  UseGetNgrokStatus
>;
