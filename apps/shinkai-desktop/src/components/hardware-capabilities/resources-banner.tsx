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
import { AlertTriangle } from 'lucide-react';

import { useHardwareCapabilitiesGetSummaryQuery } from '../../lib/hardware-capabilities.ts/hardware_capabilities-client';
import { showAnimation } from '../../pages/layout/main-layout';
import { useSettings } from '../../store/settings';
const MIN_RAM_GB = 16;
const MIN_CPUS = 4;

export const useHardwareMinimumRequirements = () => {
  const { data: hardCapabilitiesSummary } =
    useHardwareCapabilitiesGetSummaryQuery();

  const hasMinCpus = (hardCapabilitiesSummary?.cpus || 0) >= MIN_CPUS;

  const hasMinRAM = (hardCapabilitiesSummary?.memory || 0) >= MIN_RAM_GB;

  const ramAsGb = (hardCapabilitiesSummary?.memory || 0) / 1024 / 1024 / 1024;

  return { hasMinCpus, hasMinRAM, ramAsGb, hardCapabilitiesSummary };
};

export const ResourcesBanner = ({
  className,
  isInSidebar,
}: {
  className?: string;
  isInSidebar?: boolean;
}) => {
  const { hasMinCpus, hasMinRAM, ramAsGb, hardCapabilitiesSummary } =
    useHardwareMinimumRequirements();
  const sidebarExpanded = useSettings((state) => state.sidebarExpanded);

  const hasMinimumRequirements = hasMinCpus || hasMinRAM;

  const alertContent = (
    <Alert className="shadow-lg" variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-sm font-medium">
        Device Compatibility
      </AlertTitle>
      <AlertDescription className="text-xs">
        <div className="flex flex-col gap-1">
          <span>
            Your computer doesn&apos;t meet the minimum requirements:{' '}
            {hardCapabilitiesSummary?.cpus}/{MIN_CPUS} CPUs and {ramAsGb}/
            {MIN_RAM_GB}GB RAM. AI models could not work or run really slow.
          </span>

          {!hardCapabilitiesSummary?.has_discrete_gpu && (
            <span>
              Your computer doesn&apos;t has a discrete GPU so AI models could
              run really slow.
            </span>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );

  if (isInSidebar && !hasMinimumRequirements) {
    return (
      <div className={cn('flex w-full flex-col text-xs', className)}>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <Alert
                className={cn(
                  'pointer shadow-lg [&>svg]:static [&>svg~*]:pl-0',
                  'flex w-full items-center gap-2 rounded-lg px-4 py-3',
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
      {!hasMinimumRequirements && alertContent}
    </div>
  );
};
