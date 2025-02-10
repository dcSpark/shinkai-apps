import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Button } from '@shinkai_network/shinkai-ui';
import { CheckIcon, XIcon } from 'lucide-react';

import { analyticsBulletPoints } from '../constants/analytics';
import { useSettings } from '../store/settings';
import { SimpleLayout } from './layout/simple-layout';

const AnalyticsSettingsPage = () => {
  const { t, Trans } = useTranslation();
  const optInAnalytics = useSettings((state) => state.optInAnalytics);
  const denyAnalytics = useSettings((state) => state.denyAnalytics);
  const acceptAnalytics = useSettings((state) => state.acceptAnalytics);

  return (
    <SimpleLayout classname="max-w-xl" title="Analytics">
      <div className="flex flex-col justify-between space-y-8">
        <p>{t('analytics.title')}</p>
        <div className="mt-10 flex flex-1 flex-col gap-10 text-sm text-gray-50">
          <ul className="text-gray-80 space-y-5">
            {analyticsBulletPoints().map((item) => (
              <li className="flex items-center gap-2" key={item}>
                <Trans
                  components={{
                    check: <CheckIcon className="h-5 w-5 shrink-0" />,
                    x: <XIcon className="h-5 w-5 shrink-0" />,
                  }}
                  i18nKey={item}
                />
              </li>
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
              size="sm"
            >
              {t('common.optOut')}
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() => {
                acceptAnalytics();
              }}
              size="sm"
            >
              {t('common.optIn')}
            </Button>
          )}
        </div>
      </div>
    </SimpleLayout>
  );
};

export default AnalyticsSettingsPage;
