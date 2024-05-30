import { buttonVariants } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Link } from 'react-router-dom';

import { SubpageLayout } from './layout/simple-layout';

const ShinkaiPrivatePage = () => {
  return (
    <SubpageLayout title="Connect AI">
      <div className="flex h-full flex-col">
        <p className="text-gray-80 text-center text-base tracking-wide">
          Add AI models to be used with Shinkai. You can run your own locally,
          or use our hosted service if you have a low-spec computer.
        </p>
        <div className="mt-20 flex flex-1 flex-col gap-6">
          <Link
            className={cn(
              buttonVariants({
                size: 'lg',
              }),
              'w-full',
            )}
            to={{
              pathname: '/free-subscriptions',
            }}
          >
            Hosted AI Free Trial
          </Link>
          <Link
            className={cn(
              buttonVariants({
                variant: 'ghost',

                size: 'lg',
              }),
              'w-full',
            )}
            state={{
              installLocally: true,
            }}
            to={{
              pathname: '/free-subscriptions',
            }}
          >
            Hosted Free Trial + Install Locally
          </Link>
          <Link
            className={cn(
              buttonVariants({
                variant: 'ghost',
                size: 'lg',
              }),
              'w-full',
            )}
            to={{
              pathname: '/ai-model-installation',
            }}
          >
            Install AI Locally [Free]
          </Link>
        </div>
      </div>
    </SubpageLayout>
  );
};

export default ShinkaiPrivatePage;
