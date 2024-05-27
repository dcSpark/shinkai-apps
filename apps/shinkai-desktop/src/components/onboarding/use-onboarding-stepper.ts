import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/lib/queries/getHealth/useGetHealth';
import { useGetInboxes } from '@shinkai_network/shinkai-node-state/lib/queries/getInboxes/useGetInboxes';
import { useGetVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/useGetVRPathSimplified';
import { transformDataToTreeNodes } from '@shinkai_network/shinkai-node-state/lib/utils/files';
import { useMap } from '@shinkai_network/shinkai-ui/hooks';
import { useEffect } from 'react';

import { useAuth } from '../../store/auth';
import { GetStartedStatus, GetStartedSteps } from './onboarding';

export const useOnboardingSteps = () => {
  const currentStepsMap = useMap<GetStartedSteps, GetStartedStatus>();
  const auth = useAuth((state) => state.auth);

  const { nodeInfo, isSuccess } = useGetHealth(
    { node_address: auth?.node_address ?? '' },
    { enabled: !!auth },
  );

  const { agents } = useAgents({
    nodeAddress: auth?.node_address ?? '',
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}`,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const { inboxes } = useGetInboxes(
    {
      nodeAddress: auth?.node_address ?? '',
      sender: auth?.shinkai_identity ?? '',
      senderSubidentity: auth?.profile ?? '',
      receiver: auth?.shinkai_identity ?? '',
      targetShinkaiNameProfile: `${auth?.shinkai_identity}/${auth?.profile}`,
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    },
    {},
  );

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

  useEffect(() => {
    if (isSuccess && nodeInfo?.status === 'ok') {
      currentStepsMap.set(
        GetStartedSteps.SetupShinkaiNode,
        GetStartedStatus.Done,
      );
    }
  }, [isSuccess]);

  useEffect(() => {
    if (agents.length > 1) {
      currentStepsMap.set(GetStartedSteps.CreateAI, GetStartedStatus.Done);
    }
  }, [agents]);

  useEffect(() => {
    if (VRFiles) {
      console.log(transformDataToTreeNodes(VRFiles), '11111');
    }
  }, [VRFiles]);
  useEffect(() => {
    if (inboxes.length > 1) {
      currentStepsMap.set(GetStartedSteps.CreateAIChat, GetStartedStatus.Done);
    }
    if (
      inboxes.filter(
        (inbox) =>
          inbox.job_scope.vector_fs_folders || inbox.job_scope.vector_fs_items,
      ).length > 1
    ) {
      currentStepsMap.set(
        GetStartedSteps.AskQuestionToFiles,
        GetStartedStatus.Done,
      );
    }
  }, [inboxes]);

  return currentStepsMap;
};
