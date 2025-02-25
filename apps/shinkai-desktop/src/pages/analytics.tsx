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
    <div className="mx-auto flex h-full max-w-lg flex-col gap-8">
      <h1 className="font-clash text-4xl font-semibold">
        {t('analytics.title')}
      </h1>
      <div className="text-official-gray-300 flex flex-1 flex-col gap-10 text-base">
        <ul className="space-y-3">
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
        <p>
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

      <div className="flex flex-col items-center gap-4">
        <Button
          className="w-full"
          onClick={() => {
            acceptAnalytics();
            navigate('/ai-provider-selection');
          }}
          size="lg"
        >
          {t('common.iAgree')}
        </Button>
        <Button
          className="w-full"
          onClick={() => {
            denyAnalytics();
            navigate('/ai-provider-selection');
          }}
          size="lg"
          variant="outline"
        >
          {t('common.noThanks')}
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsPage;
