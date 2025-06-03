import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type GetLLMProvidersResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { type QueryObserverOptions } from '@tanstack/react-query';

import { type FunctionKeyV2 } from '../../constants';

export type GetLLMProvidersInput = Token & {
  nodeAddress: string;
};

export type GetLLMProvidersOutput = GetLLMProvidersResponse;

export type UseGetLLMProviders = [
  FunctionKeyV2.GET_LLM_PROVIDERS,
  GetLLMProvidersInput,
];

export type Options = QueryObserverOptions<
  GetLLMProvidersOutput,
  Error,
  GetLLMProvidersOutput,
  GetLLMProvidersOutput,
  UseGetLLMProviders
>;
