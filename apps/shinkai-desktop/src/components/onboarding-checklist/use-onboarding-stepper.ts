import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/v2/queries/getHealth/useGetHealth';
import { useGetInboxesWithPagination } from '@shinkai_network/shinkai-node-state/v2/queries/getInboxes/useGetInboxesWithPagination';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import { useMap } from '@shinkai_network/shinkai-ui/hooks';
import { useEffect } from 'react';

import { useAuth } from '../../store/auth';
import { GetStartedStatus, GetStartedSteps } from './onboarding';

export const useOnboardingSteps = () => {
  const currentStepsMap = useMap<GetStartedSteps, GetStartedStatus>();
  const auth = useAuth((state) => state.auth);

  const { nodeInfo, isSuccess } = useGetHealth(
    { nodeAddress: auth?.node_address ?? '' },
    { enabled: !!auth },
  );

  const { data: agents } = useGetAgents({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { data: inboxesPagination } = useGetInboxesWithPagination({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { data: myToolList } = useGetTools(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
    },
    {
      select: (data) =>
        data.filter(
          (tool) => 'author' in tool && tool.author === auth?.shinkai_identity,
        ) ?? [],
    },
  );

  useEffect(() => {
    if (isSuccess && nodeInfo?.status === 'ok') {
      currentStepsMap.set(
        GetStartedSteps.SetupShinkaiNode,
        GetStartedStatus.Done,
      );
    }
  }, [isSuccess]);

  useEffect(() => {
    if ((agents ?? [])?.length > 4) {
      currentStepsMap.set(GetStartedSteps.CreateAIAgent, GetStartedStatus.Done);
    }
  }, [agents]);

  useEffect(() => {
    const inboxes =
      inboxesPagination?.pages.flatMap((page) => page.inboxes) ?? [];

    const hasMoreThan1ChatWithAgent = inboxes.find(
      (inbox) => inbox?.provider_type === 'Agent',
    );

    if (hasMoreThan1ChatWithAgent) {
      currentStepsMap.set(
        GetStartedSteps.CreateAIChatWithAgent,
        GetStartedStatus.Done,
      );
    }
  }, [inboxesPagination]);

  useEffect(() => {
    if (myToolList?.length && myToolList.length > 0) {
      currentStepsMap.set(GetStartedSteps.CreateTool, GetStartedStatus.Done);
    }
  }, [myToolList]);

  return currentStepsMap;
};
