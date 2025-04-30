import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getAgentInboxes } from '.';
import { GetAgentInboxesInput } from './types';

export const useGetAgentInboxes = (input: GetAgentInboxesInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_AGENT_INBOXES, input.agentId],
    queryFn: async () => getAgentInboxes(input),
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
