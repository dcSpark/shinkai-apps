import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Button } from '@shinkai_network/shinkai-ui';
import { useNavigate } from 'react-router-dom';

import { useSettings } from '../store/settings';
import OnboardingLayout from './layout/onboarding-layout';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const denyAnalytics = useSettings((state) => state.denyAnalytics);
  const acceptAnalytics = useSettings((state) => state.acceptAnalytics);

  return (
    <OnboardingLayout>
      <div className="mx-auto flex h-full max-w-lg flex-col">
        <p className="text-center text-3xl font-medium leading-[1.5] tracking-wide">
          {t('analytics.title')}
        </p>
        <div className="mt-10 flex flex-1 flex-col gap-10 text-sm text-gray-50">
          <ul className="space-y-3 text-gray-50">
            {[
              '✅ Always allow you to opt-out via Settings',

              '✅ Randomized Analytics',

              '✅ Send analytical information about what features you use but without any content or responses',

              '❌ Never collect your IP address',

              '❌ Never collect your AI queries',

              '❌ Never use personal information for training purposes',
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="">
            Fore more information in relation to our privacy practices, please
            see our{' '}
            <a
              className={'text-white underline'}
              href={'https://www.shinkai.com/privacy-policy'}
              rel="noreferrer"
              target={'_blank'}
            >
              Privacy Policy
            </a>
          </p>
        </div>

        <div className="space-y-4">
          <Button
            className="w-full"
            onClick={() => {
              denyAnalytics();
              navigate('/get-started');
            }}
            size="lg"
            variant="ghost"
          >
            {t('common.noThanks')}
          </Button>
          <Button
            className="w-full"
            onClick={() => {
              acceptAnalytics();
              navigate('/get-started');
            }}
            size="lg"
          >
            {t('common.iAgree')}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default AnalyticsPage;
