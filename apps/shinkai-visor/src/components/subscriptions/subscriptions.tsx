import { useGetMySubscriptions } from '@shinkai_network/shinkai-node-state/lib/queries/getMySubscriptions/useGetMySubscriptions';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../../store/auth/auth';
import { UnsubscribeButton } from './components/subscription-button';
import { SubscriptionInfo } from './public-shared-folders';

const MySubscriptions = () => {
  const auth = useAuth((state) => state.auth);

  const {
    data: subscriptions,
    isSuccess,
    isPending,
  } = useGetMySubscriptions({
    nodeAddress: auth?.node_address ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  return (
    <div className="flex h-full flex-col gap-4">
      {isPending &&
        Array.from({ length: 4 }).map((_, idx) => (
          <div
            className="flex h-[69px] items-center justify-between gap-2 rounded-md bg-gray-400 py-3"
            key={idx}
          />
        ))}
      {isSuccess && !subscriptions.length && (
        <p className="text-gray-80 text-left">
          You have no subscriptions. You can subscribe to shared folders from
          other nodes.
        </p>
      )}
      {isSuccess && !!subscriptions.length && (
        <div className="">
          {subscriptions?.map((subscription) => (
            <SubscribedSharedFolder
              folderName={subscription.shared_folder.replace(/\//g, '')}
              folderPath={subscription.shared_folder}
              key={subscription.subscription_id.unique_id}
              nodeName={subscription.subscriber_node}
              streamerNodeName={subscription.streaming_node}
              streamerNodeProfile={subscription.streaming_profile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MySubscriptions;

const SubscribedSharedFolder = ({
  folderName,
  folderPath,
  nodeName,
  streamerNodeName,
  streamerNodeProfile,
}: {
  folderName: string;
  nodeName: string;
  folderPath: string;
  streamerNodeName: string;
  streamerNodeProfile: string;
}) => {
  const history = useHistory();

  return (
    <div
      className="flex min-h-[72px] cursor-pointer items-center justify-between gap-2 rounded-lg py-3.5 pr-2.5 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-400"
      onClick={() => history.push(`/node-files`)}
      role="button"
      tabIndex={0}
    >
      <SubscriptionInfo
        folderDescription=""
        folderName={folderName}
        isFree={true}
        nodeName={streamerNodeName}
      />
      <UnsubscribeButton
        folderPath={folderPath}
        streamerNodeName={streamerNodeName}
        streamerNodeProfile={streamerNodeProfile}
      />
    </div>
  );
};
