import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetLLMProvidersResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';

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
