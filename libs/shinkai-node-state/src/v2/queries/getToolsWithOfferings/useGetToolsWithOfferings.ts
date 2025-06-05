import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetToolsWithOfferingsInput, type GetToolsWithOfferingsOutput } from './types';
import { getToolsWithOfferings } from './index';

export type UseGetToolsWithOfferings = [FunctionKeyV2.GET_TOOLS_WITH_OFFERINGS, GetToolsWithOfferingsInput];

type Options = QueryObserverOptions<
  GetToolsWithOfferingsOutput,
  Error,
  GetToolsWithOfferingsOutput,
  GetToolsWithOfferingsOutput,
  UseGetToolsWithOfferings
>;

export const useGetToolsWithOfferings = (
  input: GetToolsWithOfferingsInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_TOOLS_WITH_OFFERINGS, input],
    queryFn: () => getToolsWithOfferings(input),
    ...options,
  });
  return response;
};
