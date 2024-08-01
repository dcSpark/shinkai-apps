import { useGetUserSheets } from '@shinkai_network/shinkai-node-state/lib/queries/getUserSheets/useGetUserSheets';

import { useAuth } from '../store/auth';
import { SimpleLayout } from './layout/simple-layout';

const Sheet = () => {
  const auth = useAuth((state) => state.auth);

  const { data } = useGetUserSheets({
    nodeAddress: auth?.node_address ?? '',
    profile: auth?.profile ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  console.log(data, 'data');
  return (
    <SimpleLayout classname="" title={'Shinkai Sheet'}>
      <div>welcome!</div>
    </SimpleLayout>
  );
};
export default Sheet;
