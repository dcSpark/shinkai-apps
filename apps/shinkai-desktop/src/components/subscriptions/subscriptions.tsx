import { useGetMySubscriptions } from '@shinkai_network/shinkai-node-state/lib/queries/getMySubscriptions/useGetMySubscriptions';
import { useGetSubscriptionNotifications } from '@shinkai_network/shinkai-node-state/lib/queries/getSubscriptionNotifications/useGetSubscriptionNotifications';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { formatDistance } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import { SimpleLayout } from '../../pages/layout/simple-layout';
import { useAuth } from '../../store/auth';
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

  const { data: notifications, isSuccess: isNotificationsSuccess } =
    useGetSubscriptionNotifications(
      {
        nodeAddress: auth?.node_address ?? '',
        shinkaiIdentity: auth?.shinkai_identity ?? '',
        profile: auth?.profile ?? '',
        my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
        my_device_identity_sk: auth?.my_device_identity_sk ?? '',
        node_encryption_pk: auth?.node_encryption_pk ?? '',
        profile_encryption_sk: auth?.profile_encryption_sk ?? '',
        profile_identity_sk: auth?.profile_identity_sk ?? '',
      },
      {
        refetchInterval: 20000,
      },
    );

  return (
    <SimpleLayout title="My Subscriptions">
      <div className="grid h-full grid-cols-[1fr_360px] gap-10">
        <div className="flex flex-col gap-4">
          {isPending &&
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                className="flex h-[69px] items-center justify-between gap-2 rounded-md bg-gray-400 py-3"
                key={idx}
              />
            ))}
          {isSuccess && !subscriptions.length && (
            <p className="text-gray-80 text-left">
              You have no subscriptions. You can subscribe to shared folders
              from other nodes.
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
        {isNotificationsSuccess && notifications.length && (
          <div className="-mt-14 w-full max-w-md overflow-y-auto rounded-lg bg-gray-400 p-4">
            <h2 className="mb-4 font-medium text-white">Activity</h2>
            {/*{isNotificationsSuccess && notifications.length && (*/}
            {/*  <div className="space-y-3 text-center text-sm">*/}
            {/*    <h1 className="font-medium">No Updates</h1>*/}
            {/*    <p className="text-gray-50">*/}
            {/*      When you subscribe to a knowledge, you will receive updates*/}
            {/*      here.*/}
            {/*    </p>*/}
            {/*  </div>*/}
            {/*)}*/}
            <ul className="space-y-4">
              {notifications.map((notification, idx) => (
                <li
                  className="relative flex gap-x-4"
                  key={notification.datetime}
                >
                  <div
                    className={cn(
                      idx === notifications.length - 1 ? 'h-6' : '-bottom-6',
                      'absolute left-0 top-0 flex w-6 justify-center',
                    )}
                  >
                    <div className="w-px bg-gray-200" />
                  </div>
                  <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-gray-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                  </div>
                  <div className="flex-auto py-0.5 text-xs leading-5">
                    <p className="font-medium text-white">
                      {notification.message}
                    </p>{' '}
                    <time
                      className="text-gray-80 flex-none py-0.5 text-xs leading-5"
                      dateTime={notification.datetime}
                    >
                      {formatDistance(
                        new Date(notification.datetime),
                        new Date(),
                        {
                          addSuffix: true,
                        },
                      )}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SimpleLayout>
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
      onClick={() => navigate(`/vector-fs`)}
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
