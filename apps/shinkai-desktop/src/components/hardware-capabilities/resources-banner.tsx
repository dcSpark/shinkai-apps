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

import { useHardwareCapabilitiesGetSummaryQuery } from '../../lib/hardware-capabilities.ts/hardware_capabilities-client';
import { showAnimation } from '../../pages/layout/main-layout';
import { useSettings } from '../../store/settings';

const MIN_CPUS = 4;
const MIN_RAM_GB = 16;
const RECOMMENDED_CPUS = 10;
const RECOMMENDED_RAM_GB = 32;

export const useHardwareMinimumRequirements = () => {
  const { data: hardCapabilitiesSummary } =
    useHardwareCapabilitiesGetSummaryQuery();

  const ramAsGb = (hardCapabilitiesSummary?.memory || 0) / 1024 / 1024 / 1024;
  const hasMinCpus = (hardCapabilitiesSummary?.cpus || 0) >= MIN_CPUS;
  const hasMinRAM = ramAsGb >= MIN_RAM_GB;
  const hasRecommendedCpus =
    (hardCapabilitiesSummary?.cpus || 0) >= RECOMMENDED_CPUS;
  const hasRecommendedRAM = ramAsGb >= RECOMMENDED_RAM_GB;
  const hasMinimumRequirements = hasMinCpus && hasMinRAM;
  const hasRecommendedRequirements = hasRecommendedCpus && hasRecommendedRAM;

  return {
    hardCapabilitiesSummary,
    ramAsGb,
    hasMinCpus,
    hasMinRAM,
    hasRecommendedCpus,
    hasRecommendedRAM,
    hasMinimumRequirements,
    hasRecommendedRequirements,
  };
};

export const ResourcesBanner = ({
  className,
  isInSidebar,
}: {
  className?: string;
  isInSidebar?: boolean;
}) => {
  const {
    hardCapabilitiesSummary,
    ramAsGb,
    hasMinCpus,
    hasMinRAM,
    hasMinimumRequirements,
    hasRecommendedRequirements,
  } = useHardwareMinimumRequirements();
  const sidebarExpanded = useSettings((state) => state.sidebarExpanded);

  const hasIssues =
    !hasMinimumRequirements ||
    !hasRecommendedRequirements ||
    !hardCapabilitiesSummary?.has_discrete_gpu;

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
            {(!hasMinimumRequirements) && (
              <span>
                - Your computer doesn&apos;t meet the minimum requirements:{' '}
                {MIN_CPUS} CPUs and {MIN_RAM_GB}GB RAM.
              </span>
            )}
            {(hasMinimumRequirements && !hasRecommendedRequirements) && (
              <span>
                - Your computer doesn&apos;t meet the recommended requirements:{' '}
                {RECOMMENDED_CPUS} CPUs and {RECOMMENDED_RAM_GB}GB RAM.
              </span>
            )}
            {!hardCapabilitiesSummary?.has_discrete_gpu && (
              <span>- Your computer doesn&apos;t has a discrete GPU.</span>
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

  console.log(
    'dasds',
    hasMinCpus,
    hasMinRAM,
    ramAsGb,
    hardCapabilitiesSummary,
    hasIssues,
  );
  if (isInSidebar && hasIssues) {
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
      {hasIssues && alertContent}
    </div>
  );
};
