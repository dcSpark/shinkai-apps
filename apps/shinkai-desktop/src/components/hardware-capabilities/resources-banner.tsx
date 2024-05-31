import {
  Alert,
  AlertDescription,
  AlertTitle,
  TextLink,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

import {
  RequirementsStatus,
  useHardwareGetSummaryQuery,
} from '../../lib/hardware.ts/hardware-client';
import { showAnimation } from '../../pages/layout/main-layout';
import { useSettings } from '../../store/settings';

export const ResourcesBanner = ({
  className,
  isInSidebar,
}: {
  className?: string;
  isInSidebar?: boolean;
}) => {
  const { data: hardwareSummary } = useHardwareGetSummaryQuery();
  const sidebarExpanded = useSettings((state) => state.sidebarExpanded);

  const isOptimal =
    hardwareSummary?.requirements_status === RequirementsStatus.Optimal;
  const lessThanMinimum =
    hardwareSummary?.requirements_status === RequirementsStatus.Unmeet ||
    hardwareSummary?.requirements_status === RequirementsStatus.StillUsable;
  const lessThanRecomendded =
    hardwareSummary?.requirements_status === RequirementsStatus.Unmeet ||
    hardwareSummary?.requirements_status === RequirementsStatus.StillUsable ||
    hardwareSummary?.requirements_status === RequirementsStatus.Minimum;

  const alertContent = (
    <Alert className="shadow-lg" variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-sm font-medium">
        Device Compatibility
      </AlertTitle>
      <AlertDescription className="text-xs">
        <div className="flex flex-col gap-2">
          <div>AI models could not work or run really slow.</div>

          <div className="ml-2 flex list-disc flex-col space-y-1">
            {lessThanMinimum ? (
              <span>
                - Your computer doesn&apos;t meet the minimum requirements:{' '}
                {hardwareSummary?.requirements.minimum.cpus} CPUs and{' '}
                {hardwareSummary?.requirements.minimum.memory}GB RAM.
              </span>
            ) : (
              lessThanRecomendded && (
                <span>
                  - Your computer doesn&apos;t meet the recommended
                  requirements: {hardwareSummary?.requirements.recommended.cpus}{' '}
                  CPUs and {hardwareSummary?.requirements.recommended.memory}GB
                  RAM.
                </span>
              )
            )}

            {!hardwareSummary?.hardware.discrete_gpu && (
              <span>- Your computer doesn&apos;t have a discrete GPU.</span>
            )}
          </div>
          <div className="mt-2">
            <span aria-label="lightbulb" role="img">
              💡
            </span>{' '}
            We recommend to use{' '}
            <TextLink
              className="text-yellow-200"
              label={'Shinkai Hosting'}
              url={'https://www.shinkai.com/get-shinkai'}
            />
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
  if (isInSidebar && !isOptimal) {
    return (
      <div className={cn('flex w-full flex-col text-xs', className)}>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <Alert
                className={cn(
                  'cursor-default shadow-lg [&>svg]:static [&>svg~*]:pl-0',
                  'flex w-full items-center gap-2 rounded-lg px-4 py-2',
                )}
                variant="warning"
              >
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <AnimatePresence>
                  {sidebarExpanded && (
                    <motion.span
                      animate="show"
                      className="whitespace-nowrap text-xs"
                      exit="hidden"
                      initial="hidden"
                      variants={showAnimation}
                    >
                      Device Compatibility
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
                {alertContent}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className={cn('flex w-full flex-col text-xs', className)}>
      {!isOptimal && alertContent}
    </div>
  );
};
