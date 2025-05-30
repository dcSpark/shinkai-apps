import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetAgentInboxesInput } from './types';
import { getAgentInboxes } from '.';

export const useGetAgentInboxes = (input: GetAgentInboxesInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_AGENT_INBOXES, input.agentId],
    queryFn: async () => getAgentInboxes(input),
    select: (data) =>
      // display only job inboxes
      data.filter(
        (inbox) =>
          inbox?.inbox_id?.startsWith('job_inbox::') &&
          !inbox?.custom_name?.startsWith('New Inbox:'),
      ),
    enabled: !!input.agentId,
  });
  return {
    ...response,
    inboxes: response.data ?? [],
  };
};
