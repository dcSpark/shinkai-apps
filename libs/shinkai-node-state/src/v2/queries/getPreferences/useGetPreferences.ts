import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetPreferencesInput } from './types';
import { getPreferences } from './index';

export const useGetPreferences = ({
  nodeAddress,
  token,
}: GetPreferencesInput) => {
  return useQuery({
    queryKey: [FunctionKeyV2.GET_PREFERENCES],
    queryFn: () => getPreferences({ nodeAddress, token }),
  });
};
