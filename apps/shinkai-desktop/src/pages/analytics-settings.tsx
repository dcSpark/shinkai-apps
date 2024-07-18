import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Button } from '@shinkai_network/shinkai-ui';

import { analyticsBulletPoints } from '../constants/analytics';
import { useSettings } from '../store/settings';
import { SubpageLayout } from './layout/simple-layout';

const AnalyticsSettingsPage = () => {
  const { t, Trans } = useTranslation();
  const optInAnalytics = useSettings((state) => state.optInAnalytics);
  const denyAnalytics = useSettings((state) => state.denyAnalytics);
  const acceptAnalytics = useSettings((state) => state.acceptAnalytics);

  return (
    <SubpageLayout title="Analytics">
      <div className="flex flex-col justify-between space-y-8">
        <p className="font-medium">{t('analytics.title')}</p>
        <div className="mt-10 flex flex-1 flex-col gap-10 text-sm text-gray-50">
          <ul className="space-y-5 text-gray-50">
            {analyticsBulletPoints().map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="">
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
          {optInAnalytics ? (
            <Button
              className="w-full"
              onClick={() => {
                denyAnalytics();
              }}
              size="lg"
            >
              {t('common.optOut')}
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() => {
                acceptAnalytics();
              }}
              size="lg"
            >
              {t('common.optIn')}
            </Button>
          )}
        </div>
      </div>
    </SubpageLayout>
  );
};

export default AnalyticsSettingsPage;
