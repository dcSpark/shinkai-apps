import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Button } from '@shinkai_network/shinkai-ui';
import { useNavigate } from 'react-router-dom';

import { analyticsBulletPoints } from '../constants/analytics';
import { useSettings } from '../store/settings';
import OnboardingLayout from './layout/onboarding-layout';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { t, Trans } = useTranslation();
  const denyAnalytics = useSettings((state) => state.denyAnalytics);
  const acceptAnalytics = useSettings((state) => state.acceptAnalytics);

  return (
    <OnboardingLayout>
      <div className="mx-auto flex h-full max-w-lg flex-col gap-4">
        <p className="mb-3 text-3xl font-bold">{t('analytics.title')}</p>
        <div className="flex flex-1 flex-col gap-10 text-sm text-gray-50">
          <ul className="text-gray-80 space-y-3">
            {analyticsBulletPoints().map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4">
            <Trans
              components={{
                a: (
                  <a
                    className={'text-white underline'}
                    href={'https://www.shinkai.com/privacy-policy'}
                    rel="noreferrer"
                    target={'_blank'}
                  />
                ),
              }}
              i18nKey="analytics.moreInfo"
            />
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
            variant="tertiary"
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
