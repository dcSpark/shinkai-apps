// import { useGetMySharedFolders } from '@shinkai_network/shinkai-node-state/lib/queries/getMySharedFolders/useGetMySharedFolders';
import { useGetVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/useGetVRPathSimplified';
import { getFlatChildItems } from '@shinkai_network/shinkai-node-state/lib/utils/files';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/v2/queries/getHealth/useGetHealth';
import { useGetInboxes } from '@shinkai_network/shinkai-node-state/v2/queries/getInboxes/useGetInboxes';
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

  const { inboxes } = useGetInboxes({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { data: VRFiles } = useGetVRPathSimplified({
    nodeAddress: auth?.node_address ?? '',
    profile: auth?.profile ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    path: '/',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const { data: subscriptionFolder } = useGetVRPathSimplified({
    nodeAddress: auth?.node_address ?? '',
    profile: auth?.profile ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    path: '/My Subscriptions',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  // const { data: mySharedFolders } = useGetMySharedFolders({
  //   nodeAddress: auth?.node_address ?? '',
  //   shinkaiIdentity: auth?.shinkai_identity ?? '',
  //   profile: auth?.profile ?? '',
  //   my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
  //   my_device_identity_sk: auth?.my_device_identity_sk ?? '',
  //   node_encryption_pk: auth?.node_encryption_pk ?? '',
  //   profile_encryption_sk: auth?.profile_encryption_sk ?? '',
  //   profile_identity_sk: auth?.profile_identity_sk ?? '',
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
    const currentFiles = VRFiles ? getFlatChildItems(VRFiles) : [];
    if (currentFiles.length > 2) {
      currentStepsMap.set(GetStartedSteps.UploadAFile, GetStartedStatus.Done);
    }
  }, [VRFiles]);

  useEffect(() => {
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
  }, [inboxes]);

  useEffect(() => {
    if ((subscriptionFolder?.child_folders ?? [])?.length > 0) {
      currentStepsMap.set(
        GetStartedSteps.SubscribeToKnowledge,
        GetStartedStatus.Done,
      );
    }
  }, [subscriptionFolder?.child_folders]);
  //
  // useEffect(() => {
  //   if ((mySharedFolders ?? [])?.length > 0) {
  //     currentStepsMap.set(GetStartedSteps.ShareFolder, GetStartedStatus.Done);
  //   }
  // }, [mySharedFolders]);

  return currentStepsMap;
};
