import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Button } from '@shinkai_network/shinkai-ui';
import { CheckIcon, XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { analyticsBulletPoints } from '../constants/analytics';
import { useSettings } from '../store/settings';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { t, Trans } = useTranslation();
  const denyAnalytics = useSettings((state) => state.denyAnalytics);
  const acceptAnalytics = useSettings((state) => state.acceptAnalytics);

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col gap-4">
      <p className="font-clash mb-3 text-3xl font-semibold">
        {t('analytics.title')}
      </p>
      <div className="flex flex-1 flex-col gap-10 text-sm text-gray-50">
        <ul className="text-gray-80 space-y-3">
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

      <div className="flex items-center gap-4">
        <Button
          className="w-full"
          onClick={() => {
            denyAnalytics();
            navigate('/get-started');
          }}
          size="lg"
          variant="outline"
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
  );
};

export default AnalyticsPage;
