import '../../theme/styles.css';

import { Button } from '@shinkai_network/shinkai-ui';
import { CornerRightUp } from 'lucide-react';
import * as React from 'react';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { MemoryRouter as Router } from 'react-router-dom';

import visorLogo from '../../assets/icons/visor.svg';
import coverImage from '../../assets/images/setup-cover.png';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { langMessages, locale } from '../../lang/intl';
import { sendMessage } from '../../service-worker/communication/internal';
import { ServiceWorkerInternalMessageType } from '../../service-worker/communication/internal/types';

const SetupStepOne = ({
  setStepNumber,
}: {
  setStepNumber: React.Dispatch<React.SetStateAction<number>>;
}) => {
  useEffect(() => {
    const checkPin = async () => {
      const userSettings = await chrome.action.getUserSettings();
      if (userSettings.isOnToolbar) {
        setStepNumber(1);
      }
    };
    checkPin();
    const intervalId = setInterval(checkPin, 1000);
    return () => clearInterval(intervalId);
  }, [setStepNumber]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="absolute right-[70px] top-10 flex flex-col items-center gap-6 ">
        <CornerRightUp />
        <div className="flex gap-2 font-semibold">
          <span>Click</span>
          <svg fill="none" height="20" viewBox="0 0 14 14" width="20">
            <path
              d="M12.218 6.60429H11.2273V3.96258C11.2273 3.2328 10.6362 2.64171 9.90645 2.64171H7.26472V1.65107C7.26472 0.739675 6.52505 0 5.61365 0C4.70225 0 3.96258 0.739675 3.96258 1.65107V2.64171H1.32086C0.591087 2.64171 0.0066035 3.2328 0.0066035 3.96258L0.00329375 6.4722H0.99064C1.97468 6.4722 2.7738 7.27133 2.7738 8.25536C2.7738 9.2394 1.97468 10.0385 0.99064 10.0385H0.00330975L0 12.5481C0 13.2779 0.591087 13.869 1.32086 13.869H3.83049V12.8784C3.83049 11.8943 4.62961 11.0952 5.61365 11.0952C6.59769 11.0952 7.39681 11.8943 7.39681 12.8784V13.869H9.90644C10.6362 13.869 11.2273 13.2779 11.2273 12.5481V9.90645H12.2179C13.1293 9.90645 13.869 9.16678 13.869 8.25538C13.869 7.34398 13.1293 6.60429 12.218 6.60429Z"
              fill="currentColor"
            />
          </svg>
          <span>to pin Shinkai</span>
        </div>
      </div>

      <div className=" flex h-[532px] w-[506px] flex-col items-center justify-between rounded-2xl bg-gray-400 px-6 py-7">
        <img
          alt="shinkai-app-logo"
          className="w-[90px] self-start"
          src={srcUrlResolver(visorLogo)}
        />
        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            <span className="text-[hsl(359.24deg_98.75%_68.63%)]">
              {' '}
              Pin Shinkai
            </span>{' '}
            to your browser
          </p>
          <p className="text-gray-80 text-base">
            Quick access to your Advanced Personal AI
          </p>
        </div>
        <div className="h-[270px] overflow-hidden rounded-xl">
          <img
            alt=""
            className="h-full w-full object-contain"
            src="./pin-extension.png"
          />
        </div>
        <Button
          onClick={() => {
            setStepNumber(1);
          }}
          variant="link"
        >
          Skip
        </Button>
      </div>
    </div>
  );
};

const SetupStepTwo = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative flex h-[532px] w-[506px] flex-col items-center justify-between rounded-2xl bg-gray-400 px-6 py-7">
        <img
          alt="shinkai-app-logo"
          className="w-[90px] self-start"
          src={srcUrlResolver(visorLogo)}
        />
        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            Welcome to
            <span className="text-[hsl(359.24deg_98.75%_68.63%)]">
              {' '}
              Shinkai Visor
            </span>{' '}
            <span aria-hidden={true} className={'ml-1 text-2xl'}>
              🎉{' '}
            </span>
          </p>
        </div>
        <div className="relative">
          <img
            alt={''}
            className="w-full object-cover"
            src={srcUrlResolver(coverImage)}
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform" />
        </div>
        <Button
          onClick={() => {
            sendMessage({
              type: ServiceWorkerInternalMessageType.OpenSidePanel,
            });
          }}
        >
          Try it now
        </Button>
      </div>
    </div>
  );
};
export const Setup = () => {
  const [stepNumber, setStepNumber] = React.useState(0);

  return stepNumber === 0 ? (
    <SetupStepOne setStepNumber={setStepNumber} />
  ) : (
    <SetupStepTwo />
  );
};

console.log('hello world');
const container = document.getElementById('root');
if (!container) {
  throw new Error(`container with id root not found`);
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <IntlProvider locale={locale} messages={langMessages}>
      <div className="font-inter h-full w-full">
        <Router>
          <Setup />
        </Router>
      </div>
    </IntlProvider>
  </React.StrictMode>,
);
