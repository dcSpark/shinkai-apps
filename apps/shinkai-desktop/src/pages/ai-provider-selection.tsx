import { buttonVariants } from '@shinkai_network/shinkai-ui';
import {
  ArrowRightIcon,
  CloudModelIcon,
  LocalModelIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Link, useNavigate } from 'react-router-dom';

import {
  OnboardingStep,
  ProviderSelectionUser,
} from '../components/onboarding/constants';
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
          Set Up Your AI Models
        </h1>
        <p className="text-official-gray-400 text-base">
          <span className="font-medium text-white">
            You already have access to a free AI model with a limited usage that
            resets daily — ready to use. <br />
            <br />
          </span>
          Tailor your experience by adding more models to fit your needs.
          Whether you want cloud-based speed or local control, you can easily
          switch between models anytime.
        </p>
      </div>
      <div className="flex flex-col gap-5">
        <ProviderCard
          description="Connect to AI models hosted online, ideal for real-time processing and scalable AI tasks. "
          icon={<CloudModelIcon className="w-full" />}
          onClick={() => {
            completeStep(
              OnboardingStep.AI_PROVIDER_SELECTION,
              ProviderSelectionUser.CLOUD,
            );
            navigate('/install-ai-models?provider=cloud');
          }}
          title="Add Cloud AI Model"
        />

        <ProviderCard
          description="Run AI models directly on your device, offering more control, enabling offline use and enhancing privacy. "
          icon={<LocalModelIcon className="w-full" />}
          onClick={() => {
            completeStep(
              OnboardingStep.AI_PROVIDER_SELECTION,
              ProviderSelectionUser.LOCAL,
            );
            navigate('/install-ai-models?provider=local');
          }}
          title="Add Local AI Model"
        />
        <Link
          className={cn(
            buttonVariants({
              variant: 'link',
              size: 'auto',
              rounded: 'lg',
            }),
            'inline text-center text-base font-normal',
          )}
          onClick={() => {
            completeStep(
              OnboardingStep.AI_PROVIDER_SELECTION,
              ProviderSelectionUser.FREE,
            );
            navigate('/inboxes');
          }}
          to={'/'}
        >
          Skip for now — you can add models anytime!
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
        'bg-official-gray-950/80 flex flex-col px-3 py-3.5',
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3 text-left">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-white/5 p-2">
          {icon}
        </span>
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="text-official-gray-400 text-sm">{description}</p>
        </div>
        <ArrowRightIcon className="pt-1 text-white" />
      </div>
    </button>
  );
};
