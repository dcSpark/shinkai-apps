import { useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getNodeFiles } from '.';

export const useGetNodeFiles = () => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_NODE_FILES],
    queryFn: getNodeFiles,
  });
  return { ...response, nodeFiles: response.data ?? [] };
};
