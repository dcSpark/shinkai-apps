import {
  Alert,
  AlertDescription,
  AlertTitle,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, Loader2, Rocket } from 'lucide-react';

import {
  useCheckUpdateQuery,
  useInstallUpdateMutation,
  useRelaunchMutation,
} from '../../lib/updater/updater-client';
import { showAnimation } from '../../pages/layout/main-layout';
import { useSettings } from '../../store/settings';

export const UpdateBanner = ({ className }: { className?: string }) => {
  const CHECK_UPDATE_INTERVAL_MS = 60 * 60 * 1000;
  const sidebarExpanded = useSettings((state) => state.sidebarExpanded);
  const { data: checkUpdate } = useCheckUpdateQuery({
    refetchInterval: CHECK_UPDATE_INTERVAL_MS,
  });
  const { mutateAsync: installUpdate, isPending: isInstallUpdatePending } =
    useInstallUpdateMutation({
      onSuccess: () => {},
    });
  const { mutateAsync: relaunch } = useRelaunchMutation();

  const applyUpdate = async () => {
    if (isInstallUpdatePending) {
      return;
    }
    await installUpdate();
    await relaunch();
  };

  const banner = (
    <Alert className="shadow-lg" variant="success">
      <Rocket className="h-4 w-4" />
      <AlertTitle className="text-sm font-medium">
        New update available!
      </AlertTitle>
      <AlertDescription className="text-xs">
        <div className="mt-2 flex flex-col gap-1">
          <div>
            A new Shinkai Desktop version{' '}
            <span className="font-bold">v{checkUpdate?.manifest?.version}</span>{' '}
            is ready to be installed.
          </div>
          <div className=''>
            This will restart the application.
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
  if (checkUpdate?.shouldUpdate) {
    return (
      <div
        className={cn('flex w-full flex-col text-xs', className)}
        onClick={() => applyUpdate()}
      >
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <Alert
                className={cn(
                  'shadow-lg [&>svg]:static [&>svg~*]:pl-0',
                  'flex w-full items-center gap-2 rounded-lg px-4 py-2',
                )}
                variant="success"
              >
                {isInstallUpdatePending ? (<Loader2 className='h-5 w-5 shrink-0 animate-spin' />) : <ArrowDown className="h-5 w-5 shrink-0" />}
                
                <AnimatePresence>
                  {sidebarExpanded && (
                    <motion.span
                      animate="show"
                      className="whitespace-nowrap text-xs"
                      exit="hidden"
                      initial="hidden"
                      variants={showAnimation}
                    >
                      New update available!
                    </motion.span>
                  )}
                </AnimatePresence>
              </Alert>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                align="center"
                arrowPadding={2}
                className="max-w-md p-0"
                side="right"
              >
                {banner}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
};
