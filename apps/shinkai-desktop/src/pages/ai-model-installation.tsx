import { buttonVariants } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Link } from 'react-router-dom';

import { SubpageLayout } from './layout/simple-layout';

const AIModelInstallation = () => {
  return (
    <SubpageLayout title="Install AI">
      <div className="flex h-full flex-col">
        <img
          alt="AI Model Installation"
          src="https://via.placeholder.com/150"
        />
      </div>
      <Link
        className={cn(
          buttonVariants({
            size: 'lg',
          }),
          'mt-4 w-full',
        )}
        to={{
          pathname: '/',
        }}
      >
        Continue
      </Link>
    </SubpageLayout>
  );
};

export default AIModelInstallation;
