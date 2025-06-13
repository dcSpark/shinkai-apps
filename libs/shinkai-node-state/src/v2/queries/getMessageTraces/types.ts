import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  type GetMessageTracesRequest,
  type GetMessageTracesResponse,
} from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { type UseQueryOptions } from '@tanstack/react-query';
import { type FunctionKeyV2 } from '../../constants';

export type GetMessageTracesInput = Token & {
  nodeAddress: string;
  messageId: string;
};

export type GetMessageTracesOutput = GetMessageTracesResponse;

export type GetMessageTracesQueryKey = [
  FunctionKeyV2.GET_MESSAGE_TRACES,
  GetMessageTracesInput,
];

export type Options = UseQueryOptions<
  GetMessageTracesOutput,
  Error,
  GetMessageTracesOutput,
  GetMessageTracesQueryKey
>;
