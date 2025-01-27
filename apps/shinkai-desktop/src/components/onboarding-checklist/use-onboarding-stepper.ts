import { flattenDirectoryContents } from '@shinkai_network/shinkai-node-state/lib/utils/files';
import { useGetListDirectoryContents } from '@shinkai_network/shinkai-node-state/v2/queries/getDirectoryContents/useGetListDirectoryContents';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/v2/queries/getHealth/useGetHealth';
import { useGetInboxesWithPagination } from '@shinkai_network/shinkai-node-state/v2/queries/getInboxes/useGetInboxesWithPagination';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { useMap } from '@shinkai_network/shinkai-ui/hooks';
import { useEffect } from 'react';

import { useAuth } from '../../store/auth';
import { useShinkaiNodeManager } from '../../store/shinkai-node-manager';
import { GetStartedStatus, GetStartedSteps } from './onboarding';

export const useOnboardingSteps = () => {
  const currentStepsMap = useMap<GetStartedSteps, GetStartedStatus>();
  const auth = useAuth((state) => state.auth);
  const isLocalShinkaiNodeInUse = useShinkaiNodeManager(
    (state) => state.isInUse,
  );

  const { nodeInfo, isSuccess } = useGetHealth(
    { nodeAddress: auth?.node_address ?? '' },
    { enabled: !!auth },
  );

  const { llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { data: inboxesPagination } = useGetInboxesWithPagination({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { data: VRFiles } = useGetListDirectoryContents({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    path: '/',
    depth: 3,
  });

  // const { data: subscriptionFolder } = useGetListDirectoryContents({
  //   nodeAddress: auth?.node_address ?? '',
  //   token: auth?.api_v2_key ?? '',
  //   path: '/My Subscriptions',
  // });

  useEffect(() => {
    if (isSuccess && nodeInfo?.status === 'ok') {
      currentStepsMap.set(
        GetStartedSteps.SetupShinkaiNode,
        GetStartedStatus.Done,
      );
    }
  }, [isSuccess]);

  useEffect(() => {
    // const defaultAgentsCount = isLocalShinkaiNodeInUse ? 0 : 3;
    if (llmProviders.length > 0) {
      currentStepsMap.set(GetStartedSteps.CreateAI, GetStartedStatus.Done);
    }
  }, [llmProviders, isLocalShinkaiNodeInUse]);

  useEffect(() => {
    const currentFiles = VRFiles ? flattenDirectoryContents(VRFiles) : [];
    if (currentFiles.length > 2) {
      currentStepsMap.set(GetStartedSteps.UploadAFile, GetStartedStatus.Done);
    }
  }, [VRFiles]);

  useEffect(() => {
    const inboxes =
      inboxesPagination?.pages.flatMap((page) => page.inboxes) ?? [];

    if (inboxes.length > 1) {
      currentStepsMap.set(GetStartedSteps.CreateAIChat, GetStartedStatus.Done);
    }
    const hasMoreThan1Folder =
      inboxes.filter(
        (inbox) => (inbox?.job_scope?.vector_fs_folders ?? []).length > 1,
      ).length > 1;
    const hasMoreThanZeroItem =
      inboxes.filter(
        (inbox) => (inbox?.job_scope?.vector_fs_items ?? []).length > 0,
      ).length > 0;

    if (hasMoreThanZeroItem || hasMoreThan1Folder) {
      currentStepsMap.set(
        GetStartedSteps.AskQuestionToFiles,
        GetStartedStatus.Done,
      );
    }
  }, [inboxesPagination]);

  // useEffect(() => {
  //   if ((subscriptionFolder ?? [])?.length > 0) {
  //     currentStepsMap.set(
  //       GetStartedSteps.SubscribeToKnowledge,
  //       GetStartedStatus.Done,
  //     );
  //   }
  // }, [subscriptionFolder]);

  return currentStepsMap;
};
