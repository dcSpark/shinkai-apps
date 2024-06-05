import { Button } from '@shinkai_network/shinkai-ui';

import { useSettings } from '../store/settings';
import { SubpageLayout } from './layout/simple-layout';

export const analyticsBulletPoints = [
  '✅ Always allow you to opt-out via Settings',
  '✅ Randomized Analytics',
  '✅ Send analytical information about what features you use but without any content or responses',
  '❌ Never collect your IP address',
  '❌ Never collect your AI queries',
  '❌ Never use personal information for training purposes',
];

const AnalyticsSettingsPage = () => {
  const optInAnalytics = useSettings((state) => state.optInAnalytics);
  const denyAnalytics = useSettings((state) => state.denyAnalytics);
  const acceptAnalytics = useSettings((state) => state.acceptAnalytics);

  return (
    <SubpageLayout title="Analytics">
      <div className="flex flex-col justify-between space-y-8">
        <p className="font-medium">Help us improve Shinkai</p>
        <div className="mt-10 flex flex-1 flex-col gap-10 text-sm text-gray-50">
          <ul className="space-y-5 text-gray-50">
            {analyticsBulletPoints.map((item) => (
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
          {optInAnalytics ? (
            <Button
              className="w-full"
              onClick={() => {
                denyAnalytics();
              }}
              size="lg"
            >
              Opt Out
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() => {
                acceptAnalytics();
              }}
              size="lg"
            >
              Opt In
            </Button>
          )}
        </div>
      </div>
    </SubpageLayout>
  );
};

export default AnalyticsSettingsPage;
