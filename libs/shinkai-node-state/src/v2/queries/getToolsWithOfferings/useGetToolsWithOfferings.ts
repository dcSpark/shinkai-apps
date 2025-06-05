import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getToolsWithOfferings } from '.';
import type { GetToolsWithOfferingsInput } from './types';

export const useGetToolsWithOfferings = (input: GetToolsWithOfferingsInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_TOOLS_WITH_OFFERINGS],
    queryFn: () => getToolsWithOfferings(input),
  });
  return response;
};
