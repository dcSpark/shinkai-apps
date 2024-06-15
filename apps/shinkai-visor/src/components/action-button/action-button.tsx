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
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { ShinkaiLogoIcon } from '@shinkai_network/shinkai-ui/assets';
import { createShadowRoot, delay } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { motion } from 'framer-motion';
import {
  Focus,
  FolderDown,
  NotebookPenIcon,
  PanelTopIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';
import * as React from 'react';
import { useEffect, useRef } from 'react';

import { useGlobalActionButtonChromeMessage } from '../../hooks/use-global-action-button-chrome-message';
import useKeyboardShortcut from '../../hooks/use-keyboard-shortcut';
import { OPEN_SIDEPANEL_DELAY_MS } from '../../service-worker/action';
import { ServiceWorkerInternalMessageType } from '../../service-worker/communication/internal/types';
import { useSettings } from '../../store/settings/settings';
import themeStyle from '../../theme/styles.css?inline';
import {
  saveVectorResourceFound,
  sendVectorResourceFound,
  useVectorResourceMetatags,
} from './vr-notification';
import notificationStyle from './vr-notification.css?inline';

export const SHINKAI_ACTION_ELEMENT_NAME = 'shinkai-action-button-root';

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
  const { isVectorResourceFound, currentVectorResource } =
    useVectorResourceMetatags();

  const displayActionButton = useSettings(
    (settingsStore) => settingsStore.displayActionButton,
  );
  const prevDisplayActionButton = useRef<boolean>(displayActionButton);

  const setDisplayActionButton = useSettings(
    (settingsStore) => settingsStore.setDisplayActionButton,
  );
  const disabledHosts = useSettings(
    (settingsStore) => settingsStore.disabledHosts,
  );
  const setDisabledHosts = useSettings(
    (settingsStore) => settingsStore.setDisabledHosts,
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return disabledHosts[window.location.host] ? null : (
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
          'z-max group fixed h-0 transition-transform duration-300 ease-in-out print:hidden',
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
                className="hover:bg-brand overflow shadow-4xl h-[48px] w-[48px] rounded-2xl bg-gray-500 p-2 shadow-2xl transition-colors duration-75"
                data-testid="action-button"
                onClick={toggleSidePanel}
              >
                <ShinkaiLogoIcon className={'h-full w-full select-none'} />
              </motion.button>
            </HoverCardTrigger>
            <HoverCardContent className="relative">
              <button
                className={cn(
                  'absolute top-[-60px] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#797e87] p-1 text-white',
                  isLeft ? 'right-[-16px]' : 'left-[-16px]',
                )}
                onClick={() => {
                  const currentHost = window.location.host;
                  const prevDisabledHosts = {
                    ...disabledHosts,
                    [currentHost]: true,
                  };
                  setDisabledHosts(prevDisabledHosts);
                }}
              >
                <XIcon />
              </button>

              {[
                createAction(
                  isVectorResourceFound,
                  'Shinkai Instant Q/A Available',
                  () => sendVectorResourceFound(currentVectorResource),
                  <ZapIcon className="h-full w-full" />,
                ),
                {
                  label: 'Save Webpage To AI Files',
                  onClick: () => saveVectorResourceFound(currentVectorResource),
                  icon: <FolderDown className="h-full w-full" />,
                },
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
                .map((item) => {
                  return (
                    <TooltipProvider key={item?.label}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              'hover:bg-brand flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-500 p-2 text-white shadow-2xl transition-colors duration-75',
                              item?.label === 'VR Available' && 'bg-brand',
                            )}
                            onClick={item?.onClick}
                          >
                            {item?.icon}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          align="center"
                          side="left"
                          sideOffset={3}
                        >
                          <p className="font-inter">{item?.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
            </HoverCardContent>
          </HoverCard>
        </DraggableItem>
      </div>
    </DndContext>
  );
};

const root = createShadowRoot(
  SHINKAI_ACTION_ELEMENT_NAME,
  `${themeStyle}
  ${notificationStyle}
`,
);
root.render(
  <React.StrictMode>
    <Toaster
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        className: 'bg-neutral-900 rounded-full text-sm font-medium px-3 py-2',
      }}
    />

    <ActionButton />
  </React.StrictMode>,
);
