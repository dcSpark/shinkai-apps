import { buttonVariants } from '@shinkai_network/shinkai-ui';
import {
  ArrowRightIcon,
  CloudModelIcon,
  LocalModelIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Link, useNavigate } from 'react-router-dom';

import { OnboardingStep } from '../components/onboarding/constants';
import { useStepNavigation } from '../routes';
import { useSettings } from '../store/settings';

const AIProviderSelection = () => {
  const navigate = useNavigate();
  const completeStep = useSettings((state) => state.completeStep);

  useStepNavigation(OnboardingStep.AI_PROVIDER_SELECTION);

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
      <div className="flex flex-col gap-5">
        <ProviderCard
          description="Connect to AI models hosted online, ideal for real-time processing and scalable AI tasks. "
          icon={<CloudModelIcon className="size-6" />}
          onClick={() => {
            completeStep(OnboardingStep.AI_PROVIDER_SELECTION, ModelType.CLOUD);
            navigate('/install-ai-models?provider=cloud');
          }}
          title="Use a Cloud Provider"
        />

        <ProviderCard
          description="Run AI models directly on your device, offering more control, enabling offline use and enhancing privacy. "
          icon={<LocalModelIcon className="size-6" />}
          onClick={() => {
            completeStep(OnboardingStep.AI_PROVIDER_SELECTION, ModelType.LOCAL);
            navigate('/install-ai-models?provider=local');
          }}
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
          onClick={() => {
            completeStep(OnboardingStep.AI_PROVIDER_SELECTION, ModelType.FREE);
            navigate('/inboxes');
          }}
          to={'/'}
        >
          Skip for now, I&apos;ll do it later
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
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) => {
  return (
    <button
      className={cn(
        buttonVariants({
          variant: 'outline',
          size: 'auto',
          rounded: 'lg',
        }),
        'flex flex-col',
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2 text-left">
        <span className="pt-1">{icon}</span>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-official-gray-400 text-sm">{description}</p>
        </div>
        <ArrowRightIcon className="pt-1 text-white" />
      </div>
    </button>
  );
};
