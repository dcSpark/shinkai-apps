import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getInboxes } from '.';
import { GetInboxesInput } from './types';

export const useGetInboxes = (input: GetInboxesInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_INBOXES_WITH_PAGINATION, input],
    queryFn: async () => getInboxes(input),
    select: (data) =>
      // display only job inboxes
      data.filter(
        (inbox) =>
          inbox?.inbox_id?.split('::')?.[0] === 'job_inbox' &&
          inbox.is_finished === false,
      ),
  });
  return {
    ...response,
    inboxes: response.data ?? [],
  };
};
