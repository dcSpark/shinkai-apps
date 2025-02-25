import { buttonVariants } from '@shinkai_network/shinkai-ui';
import {
  ArrowRightIcon,
  CloudModelIcon,
  LocalModelIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Link } from 'react-router-dom';

const AIProviderSelection = () => {
  return (
    <div className="flex h-full flex-col gap-10">
      <div className="space-y-5">
        <h1 className="font-clash text-4xl font-semibold">
          Configure Your AI Model
        </h1>
        <p className="text-gray-80 text-base">
          Choose the AI model that best fits your app&apos;s needs. You can
          update this later anytime.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <ProviderCard
          description="Connect to AI models hosted online, ideal for real-time processing and scalable AI tasks. "
          href="/ai-model-installation?provider=cloud"
          icon={<CloudModelIcon className="size-6" />}
          title="Use a Cloud Provider"
        />

        <ProviderCard
          description="Run AI models directly on your device, offering more control, enabling offline use and enhancing privacy. "
          href="/ai-model-installation?provider=local"
          icon={<LocalModelIcon className="size-6" />}
          title="Install a Local Model"
        />
        <Link
          className={cn(
            buttonVariants({
              variant: 'link',
              size: 'auto',
              rounded: 'lg',
            }),
            'flex flex-col',
          )}
          to={'/'}
        >
          Skip for now, Use free trial model
        </Link>
      </div>
    </div>
  );
};

export default AIProviderSelection;

const ProviderCard = ({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) => {
  return (
    <Link
      className={cn(
        buttonVariants({
          variant: 'outline',
          size: 'auto',
          rounded: 'lg',
        }),
        'flex flex-col',
      )}
      to={href}
    >
      <div className="flex items-start gap-2">
        <span className="pt-1">{icon}</span>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-official-gray-400 text-sm">{description}</p>
        </div>
        <ArrowRightIcon className="pt-1 text-white" />
      </div>
    </Link>
  );
};
