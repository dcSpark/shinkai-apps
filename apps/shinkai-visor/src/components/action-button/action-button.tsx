import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Coordinates } from '@dnd-kit/utilities';
import {
  DraggableItem,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { motion } from 'framer-motion';
import { FileInputIcon, ScissorsIcon } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import shinkaiLogo from '../../assets/icons/shinkai-min.svg';
import { delay } from '../../helpers/misc';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { useGlobalActionButtonChromeMessage } from '../../hooks/use-global-action-button-chrome-message';
import { langMessages, locale } from '../../lang/intl';
import { OPEN_SIDEPANEL_DELAY_MS } from '../../service-worker/action';
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

const toggleSidePanel = async () => {
  const isOpen = await chrome.runtime.sendMessage({
    type: ServiceWorkerInternalMessageType.IsSidePanelOpen,
  });
  if (isOpen) {
    await chrome.runtime.sendMessage({
      type: ServiceWorkerInternalMessageType.CloseSidePanel,
    });
  } else {
    await chrome.runtime.sendMessage({
      type: ServiceWorkerInternalMessageType.OpenSidePanel,
    });
  }
};

const sendPage = async () => {
  await chrome.runtime.sendMessage({
    type: ServiceWorkerInternalMessageType.OpenSidePanel,
  });
  await delay(OPEN_SIDEPANEL_DELAY_MS);
  await chrome.runtime.sendMessage({
    type: ServiceWorkerInternalMessageType.SendPageToAgent,
  });
};

const sendCapture = async () => {
  await chrome.runtime.sendMessage({
    type: ServiceWorkerInternalMessageType.OpenSidePanel,
  });
  await chrome.runtime.sendMessage({
    type: ServiceWorkerInternalMessageType.SendCaptureToAgent,
  });
};

const ActionButton = () => {
  const settings = useSettings((settingsStore) => settingsStore.settings);
  useGlobalActionButtonChromeMessage();

  const activationConstraint = {
    delay: 150,
    tolerance: 5,
  };
  const [{ x, y }, setCoordinates] = useState<Coordinates>({ x: 0, y: 10 });
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint,
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint,
  });
  const keyboardSensor = useSensor(KeyboardSensor, {});
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const isLeft = Math.abs(x) >= window.innerWidth / 2;
  return (
    <DndContext
      modifiers={[restrictToWindowEdges]}
      onDragEnd={({ delta }) => {
        setCoordinates(({ x, y }) => ({
          x: x + delta.x,
          y: y + delta.y,
        }));
      }}
      sensors={sensors}
    >
      <div
        className={cn(
          'z-max fixed transition-transform duration-300 ease-in-out',
          settings?.displayActionButton
            ? 'translate-z-0 right-1 top-1'
            : isLeft // adding extra 10% to hide the button
              ? '-translate-x-[110%]'
              : 'translate-x-[110%]',
          isLeft ? 'left-1 right-auto' : 'left-auto right-1',
        )}
      >
        <HoverCard openDelay={150}>
          <HoverCardTrigger asChild>
            <DraggableItem top={y}>
              <motion.button
                className="hover:bg-brand overflow shadow-4xl h-[48px] w-[48px] rounded-2xl bg-gray-500 p-2 shadow-2xl transition-colors duration-75"
                data-testid="action-button"
                onClick={toggleSidePanel}
              >
                <img
                  alt="shinkai-app-logo select-none"
                  className={'h-full w-full select-none group-hover:rotate-45'}
                  src={srcUrlResolver(shinkaiLogo)}
                />
              </motion.button>
            </DraggableItem>
          </HoverCardTrigger>
          <HoverCardContent>
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
                onClick: sendCapture,
                icon: <ScissorsIcon className="h-full w-full" />,
              },
              {
                label: 'Send Page',
                onClick: sendPage,
                icon: <FileInputIcon className="h-full w-full" />,
              },
            ].map((item) => (
              <TooltipProvider key={item.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="hover:bg-brand mt-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-500 p-2 text-white shadow-2xl transition-colors duration-75"
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
    </DndContext>
  );
};

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <style>{themeStyle}</style>
    <IntlProvider locale={locale} messages={langMessages}>
      <ActionButton />
    </IntlProvider>
  </React.StrictMode>,
);
