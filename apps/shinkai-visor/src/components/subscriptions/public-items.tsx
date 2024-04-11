import { useGetAvailableSharedItems } from '@shinkai_network/shinkai-node-state/lib/queries/getAvailableSharedItems/useGetAvailableSharedItems';

import { useAuth } from '../../store/auth/auth';

const PublicItemsSubscription = () => {
  const auth = useAuth((state) => state.auth);
  const { data: response } = useGetAvailableSharedItems({
    nodeAddress: auth?.node_address,
    shinkaiIdentity: auth?.shinkai_identity,
    profile: auth?.profile,
    my_device_encryption_sk: auth?.my_device_encryption_sk,
    my_device_identity_sk: auth?.my_device_identity_sk,
    node_encryption_pk: auth?.node_encryption_pk,
    profile_encryption_sk: auth?.profile_encryption_sk,
    profile_identity_sk: auth?.profile_identity_sk,
  });

  return (
    <div>
      <h1>Public</h1>
      {JSON.stringify(response, null, 2)}
    </div>
  );
};

export default PublicItemsSubscription;
