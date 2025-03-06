import {
  Alert,
  AlertDescription,
  AlertTitle,
  Progress,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Loader2, RefreshCw, Rocket } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';

import {
  UpdateManagerState,
  useDownloadUpdateMutation,
  useGetUpdateManagerStateQuery,
  useInstallUpdateMutation,
  useRestartToApplyUpdateMutation,
  useUpdateManagerStateChangedListener,
} from '../../lib/updater/updater-client';
import { showAnimation } from '../../pages/layout/main-layout';
import { useSettings } from '../../store/settings';

const UpdateStateUI: React.FC<{
  updateManagerState: UpdateManagerState;
  sidebarExpanded: boolean;
}> = ({ updateManagerState, sidebarExpanded }) => {
  console.log('updateManagerState', updateManagerState);
  switch (updateManagerState?.event) {
    case 'available':
      return (
        <div className="flex flex-row items-center gap-2">
          <Download className="size-5 shrink-0" />
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.span
                animate="show"
                className="whitespace-nowrap text-xs"
                exit="hidden"
                initial="hidden"
                variants={showAnimation}
              >
                New update {updateManagerState.data?.updateMetadata?.version}{' '}
                available!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      );
    case 'downloading':
      return (
        <div className="flex w-full flex-col items-center justify-center space-y-1">
          <span>
            {updateManagerState.data.downloadState.downloadProgressPercent}%
          </span>
          <Progress
            className="h-2 w-full"
            max={100}
            value={
              updateManagerState.data.downloadState.downloadProgressPercent
            }
          />
        </div>
      );

    case 'ready_to_install':
      return (
        <div className="flex flex-row items-center gap-2">
          <Rocket className="size-5 shrink-0" />
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.span
                animate="show"
                className="whitespace-nowrap text-xs"
                exit="hidden"
                initial="hidden"
                variants={showAnimation}
              >
                Update ready to install
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      );

    case 'installing':
      return (
        <div className="flex flex-row items-center gap-2">
          <Loader2 className="size-5 shrink-0 animate-spin" />
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.span
                animate="show"
                className="whitespace-nowrap text-xs"
                exit="hidden"
                initial="hidden"
                variants={showAnimation}
              >
                Installing update...
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      );

    case 'restart_pending':
      return (
        <div className="flex flex-row items-center gap-2">
          <RefreshCw className="size-5 shrink-0" />
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.span
                animate="show"
                className="whitespace-nowrap text-xs"
                exit="hidden"
                initial="hidden"
                variants={showAnimation}
              >
                Restart required to complete update
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      );
    default:
      return <div>No update available {updateManagerState?.event}</div>;
  }
};

UpdateStateUI.displayName = 'UpdateStateUI';

const UpdateBanner: React.FC<{
  className?: string;
  // TODO: temporary fix to display banner on onboarding step, ideally we should add check for updates in the tray options
  isOnboardingStep?: boolean;
}> = ({ className, isOnboardingStep }) => {
  useUpdateManagerStateChangedListener();

  const sidebarExpanded = useSettings((state) => state.sidebarExpanded);

  const { data: updateStateManager } = useGetUpdateManagerStateQuery();
  const { mutateAsync: downloadUpdate, isPending: isPendingDownloadUpdate } =
    useDownloadUpdateMutation();
  const { mutateAsync: installUpdate, isPending: isPendingInstallUpdate } =
    useInstallUpdateMutation();
  const { mutateAsync: restartToApply, isPending: isPendingRestartToApply } =
    useRestartToApplyUpdateMutation();

  const isPendingUpdate =
    isPendingDownloadUpdate ||
    isPendingInstallUpdate ||
    isPendingRestartToApply;

  const download = useCallback((): void => {
    console.log('updateStateManager', updateStateManager, isPendingUpdate);

    if (isPendingUpdate) {
      return;
    }

    switch (updateStateManager?.event) {
      case 'available':
        downloadUpdate();
        break;
      case 'ready_to_install':
        installUpdate();
        break;
      case 'restart_pending':
        restartToApply();
        break;
    }
  }, [
    updateStateManager,
    isPendingUpdate,
    downloadUpdate,
    installUpdate,
    restartToApply,
  ]);

  // const banner = useMemo(
  //   () => (
  //     <Alert className="shadow-lg" variant="success">
  //       <Rocket className="h-4 w-4" />
  //       <AlertTitle className="text-sm font-medium">
  //         New update available!
  //       </AlertTitle>
  //       <AlertDescription className="text-xs">
  //         <div className="mt-2 flex flex-col gap-1">
  //           <div>
  //             A new Shinkai Desktop version{' '}
  //             <span className="font-bold">
  //               v{updateStateManager?.update?.version}
  //             </span>{' '}
  //             is ready to be installed.
  //           </div>
  //           <div className="">This will restart the application.</div>
  //         </div>
  //       </AlertDescription>
  //     </Alert>
  //   ),
  //   [updateStateManager],
  // );

  if (
    !updateStateManager ||
    updateStateManager?.event === 'no_update_available'
  ) {
    return null;
  }

  return (
    <div
      className={cn('flex w-full flex-col text-xs', className)}
      onClick={download}
    >
      <TooltipProvider delayDuration={isOnboardingStep ? 100000 : 0}>
        <Tooltip>
          <TooltipTrigger className="flex items-center gap-1">
            <Alert
              className={cn(
                'shadow-lg [&>svg]:static [&>svg~*]:pl-0',
                'flex w-full items-center gap-2 rounded-lg px-4 py-2',
              )}
              variant="success"
            >
              <div className="flex w-full flex-col space-y-1">
                <UpdateStateUI
                  sidebarExpanded={sidebarExpanded || !!isOnboardingStep}
                  updateManagerState={updateStateManager}
                />
                {/* {isOnboardingStep &&
                  updateStateManager.state === 'available' && (
                    <span className="pl-[28px] text-xs text-white/80">
                      Click here to install the latest available version.
                    </span>
                  )} */}
              </div>
            </Alert>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              align="center"
              arrowPadding={2}
              className="max-w-md p-0"
              side={isOnboardingStep ? 'bottom' : 'right'}
            >
              {/* {banner} */}
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

UpdateBanner.displayName = 'UpdateBanner';

export { UpdateBanner };
