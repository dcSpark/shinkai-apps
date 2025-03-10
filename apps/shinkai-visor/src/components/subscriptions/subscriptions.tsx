import { useGetMySubscriptions } from '@shinkai_network/shinkai-node-state/v2/queries/getMySubscriptions/useGetMySubscriptions';
import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    token: auth?.api_v2_key ?? '',
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
  streamerNodeName,
  streamerNodeProfile,
}: {
  folderName: string;
  folderPath: string;
  streamerNodeName: string;
  streamerNodeProfile: string;
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex min-h-[72px] cursor-pointer items-center justify-between gap-2 rounded-lg py-3.5 pr-2.5 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-400"
      onClick={() => navigate(`/node-files`)}
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
