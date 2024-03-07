import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
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
import { Focus, NotebookPenIcon, PanelTopIcon } from 'lucide-react';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import shinkaiLogo from '../../assets/icons/shinkai-min.svg';
import { delay } from '../../helpers/misc';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { useGlobalActionButtonChromeMessage } from '../../hooks/use-global-action-button-chrome-message';
import useKeyboardShortcut from '../../hooks/use-keyboard-shortcut';
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
const summarizePage = async () => {
  await chrome.runtime.sendMessage({
    type: ServiceWorkerInternalMessageType.OpenSidePanel,
  });
  await delay(OPEN_SIDEPANEL_DELAY_MS);
  await chrome.runtime.sendMessage({
    type: ServiceWorkerInternalMessageType.SummarizePage,
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

const createAction = (
  displayAction: boolean,
  label: string,
  onClick: () => void,
  icon: React.ReactNode,
) => {
  return displayAction ? { label, onClick, icon } : null;
};

const ActionButton = () => {
  useGlobalActionButtonChromeMessage();

  const displayActionButton = useSettings(
    (settingsStore) => settingsStore.displayActionButton,
  );
  const prevDisplayActionButton = useRef<boolean>(displayActionButton);

  const setDisplayActionButton = useSettings(
    (settingsStore) => settingsStore.setDisplayActionButton,
  );
  const displaySummaryActionButton = useSettings(
    (settingsStore) => settingsStore.displaySummaryActionButton,
  );
  const displayImageCaptureActionButton = useSettings(
    (settingsStore) => settingsStore.displayImageCaptureActionButton,
  );
  const sideButtonOffset = useSettings(
    (settingsStore) => settingsStore.sideButtonOffset,
  );
  const setSideButtonOffset = useSettings(
    (settingsStore) => settingsStore.setSideButtonOffset,
  );
  const sidebarShortcut = useSettings(
    (settingsStore) => settingsStore.sidebarShortcut,
  );
  useKeyboardShortcut(sidebarShortcut, toggleSidePanel);

  const activationConstraint = {
    delay: 150,
    tolerance: 5,
  };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint,
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint,
  });
  const keyboardSensor = useSensor(KeyboardSensor, {});
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const isLeft = Math.abs(sideButtonOffset.x) >= window.innerWidth / 2;

  useEffect(() => {
    const listenFullscreenChange = () => {
      if (document.fullscreenElement && prevDisplayActionButton.current) {
        setDisplayActionButton(false);
      }
      if (!document.fullscreenElement && prevDisplayActionButton.current) {
        setDisplayActionButton(true);
      }
    };
    document.addEventListener('fullscreenchange', listenFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', listenFullscreenChange);
    };
  }, []);

  return (
    <DndContext
      modifiers={[restrictToWindowEdges]}
      onDragEnd={({ delta }) => {
        setSideButtonOffset(({ x, y }) => ({
          x: x + delta.x,
          y: y + delta.y,
        }));
      }}
      sensors={sensors}
    >
      <div
        className={cn(
          'z-max fixed h-0 transition-transform duration-300 ease-in-out',
          displayActionButton
            ? 'translate-z-0 right-1 top-1'
            : isLeft // adding extra 10% to hide the button
              ? '-translate-x-[110%]'
              : 'translate-x-[110%]',
          isLeft ? 'left-1 right-auto' : 'left-auto right-1',
        )}
      >
        <DraggableItem top={sideButtonOffset.y}>
          <HoverCard openDelay={150}>
            <HoverCardTrigger asChild>
              <motion.button
                className="hover:bg-brand overflow shadow-4xl h-[48px] w-[48px] rounded-2xl bg-gray-500 p-2 shadow-2xl transition-colors duration-75 "
                data-testid="action-button"
                onClick={toggleSidePanel}
              >
                <img
                  alt="shinkai-app-logo select-none"
                  className={'h-full w-full select-none group-hover:rotate-45'}
                  src={srcUrlResolver(shinkaiLogo)}
                />
              </motion.button>
            </HoverCardTrigger>
            <HoverCardContent>
              {[
                createAction(
                  displaySummaryActionButton,
                  'Summarize Webpage',
                  summarizePage,
                  <NotebookPenIcon className="h-full w-full" />,
                ),
                {
                  label: 'Webpage Q/A',
                  onClick: sendPage,
                  icon: <PanelTopIcon className="h-full w-full" />,
                },
                createAction(
                  displayImageCaptureActionButton,
                  'Image Capture',
                  sendCapture,
                  <Focus className="h-full w-full" />,
                ),
              ]
                .filter(Boolean)
                .map((item) => (
                  <TooltipProvider key={item?.label}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="hover:bg-brand flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-500 p-2 text-white shadow-2xl transition-colors duration-75"
                          onClick={item?.onClick}
                        >
                          {item?.icon}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent align="center" side="left" sideOffset={3}>
                        <p className="font-inter">{item?.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
            </HoverCardContent>
          </HoverCard>
        </DraggableItem>
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
