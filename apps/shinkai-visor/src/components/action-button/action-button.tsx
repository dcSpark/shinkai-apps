import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { FileInputIcon, ScanIcon } from 'lucide-react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import shinkaiLogo from '../../assets/icons/shinkai-min.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { langMessages, locale } from '../../lang/intl';
import { sendMessage } from '../../service-worker/communication/internal';
import { ServiceWorkerInternalMessageType } from '../../service-worker/communication/internal/types';
import { useSettings } from '../../store/settings/settings';
import themeStyle from '../../theme/styles.css?inline';
export const SHINKAI_ACTION_ELEMENT_NAME = 'shinkai-action-button-root';

const baseContainer = document.createElement(SHINKAI_ACTION_ELEMENT_NAME);
const shadow = baseContainer.attachShadow({ mode: 'open' });
const container = document.createElement('div');
container.id = 'root';
shadow.appendChild(container);
const htmlRoot = document.getElementsByTagName('html')[0];
htmlRoot.prepend(baseContainer);

const ActionButton = () => {
  const settings = useSettings((settingsStore) => settingsStore.settings);
  const openPanel = () => {
    sendMessage({
      type: ServiceWorkerInternalMessageType.OpenSidePanel,
    });
  };
  return (
    <div
      className={cn(
        ' relative',
        settings?.hideActionButton ? 'hidden' : 'flex',
      )}
    >
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <button
            className=" h-[45px] w-[45px] rounded-lg bg-gray-500 p-2 shadow-2xl"
            data-testid="action-button"
            onClick={openPanel}
          >
            <img
              alt="shinkai-app-logo "
              className={'h-full w-full group-hover:rotate-45'}
              src={srcUrlResolver(shinkaiLogo)}
            />
          </button>
        </HoverCardTrigger>
        <HoverCardContent>
          <button className="absolute left-[-10px] top-[-55px] z-[15000000] flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 p-[1px] opacity-70 hover:opacity-100 ">
            <svg
              fill="none"
              hanging="8"
              height="10"
              viewBox="0 0 9 9"
              width="8"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.83725 1.30615L1.30664 7.83676M1.30664 1.30615L7.83725 7.83676"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.2"
              />
            </svg>
          </button>
          <kbd
            className={cn(
              'pointer-events-none flex w-full  select-none items-center rounded-md bg-gray-800 pl-2 font-mono text-sm font-medium text-gray-500 text-white',
              'group-hover:translate-y-[44px] group-hover:opacity-100 group-hover:transition-opacity group-hover:duration-300 group-hover:ease-in-out',
            )}
          >
            <span>⌘</span>
            <span>
              <svg
                className={'h-3 w-3'}
                fill="none"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path
                  d="M14.1995 12.343C13.4747 12.8201 12.6144 13.0486 11.7484 12.994C10.8824 12.9395 10.0576 12.6047 9.39845 12.0404C8.73931 11.476 8.28158 10.7126 8.09429 9.86531C7.907 9.01803 8.00031 8.13282 8.36015 7.34321C8.71999 6.5536 9.32684 5.90242 10.0892 5.48789C10.8515 5.07336 11.7279 4.91797 12.5863 5.04516C13.4447 5.17235 14.2384 5.57521 14.8478 6.19299C15.4571 6.81076 15.8491 7.60994 15.9645 8.46997C16.3295 10.262 16.4715 12.417 15.7575 14.368C14.9915 16.458 13.2935 18.172 10.2525 18.968C9.99906 19.0262 9.73293 18.9834 9.51052 18.8487C9.28811 18.7141 9.1269 18.498 9.06109 18.2465C8.99527 17.9949 9.03003 17.7276 9.15798 17.5013C9.28593 17.2749 9.49701 17.1073 9.74647 17.034C12.2065 16.39 13.3565 15.104 13.8795 13.68C14.0345 13.255 14.1395 12.806 14.1995 12.342"
                  fill="currentColor"
                />
              </svg>
            </span>
          </kbd>
          {[
            {
              label: 'Send Capture',
              onClick: () => {
                openPanel();
              },
              icon: <ScanIcon className="w-full" />,
            },
            {
              label: 'Send Page',
              onClick: () => {
                openPanel();
              },
              icon: <FileInputIcon className="w-full" />,
            },
          ].map((item) => (
            <TooltipProvider key={item.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="mt-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-500 p-2 text-white shadow-2xl hover:bg-gray-400"
                    onClick={item.onClick}
                  >
                    {item.icon}
                  </button>
                </TooltipTrigger>
                <TooltipContent align="center" side="left" sideOffset={3}>
                  <p className="font-inter">{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <style>{themeStyle}</style>
    <IntlProvider locale={locale} messages={langMessages}>
      <div className="shadow-4xl fixed right-[2px] top-[80px] z-[1500000000]">
        <ActionButton />
      </div>
    </IntlProvider>
  </React.StrictMode>,
);
