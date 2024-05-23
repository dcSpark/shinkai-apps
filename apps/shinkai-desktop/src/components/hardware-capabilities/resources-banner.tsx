import { Separator } from '@shinkai_network/shinkai-ui';
import { AlertTriangle } from 'lucide-react';

import { useHardwareCapabilitiesGetSummaryQuery } from '../../lib/hardware-capabilities.ts/hardware_capabilities-client';
export const ResourcesBanner = () => {
  const MIN_RAM_GB = 16;
  const MIN_CPUS = 4;

  const { data: hardCapabilitiesSummary } =
    useHardwareCapabilitiesGetSummaryQuery();

  const hasMinCpus = () => {
    return (hardCapabilitiesSummary?.cpus || 0) >= MIN_CPUS;
  };
  const hasMinRAM = () => {
    return (hardCapabilitiesSummary?.memory || 0) >= MIN_RAM_GB;
  };

  const ramAsGb = () => {
    return (hardCapabilitiesSummary?.memory || 0) / 1024 / 1024 / 1024;
  };

  return (
    <div className="z-10 flex flex-col space-y-0 text-xs relative">
      {(!hasMinCpus() || !hasMinRAM() || true) && (
        <div className="text-yellow-400 bg-yellow-900 px-4 py-1 flex flex-row items-center">
          <AlertTriangle className="h-4 w-4" />
          <span className='ml-1'>
            {' '}
            Your computer doesn&apos;t meet the minimum requirements:{' '}
          {hardCapabilitiesSummary?.cpus}/{MIN_CPUS} CPUs and {ramAsGb()}/
          {MIN_RAM_GB}GB RAM. AI models could not work or run really slow.
          </span>
        
        </div>
      )}
      {!hardCapabilitiesSummary?.has_discrete_gpu && (
        <>
        <Separator className='bg-yellow-700'/>
        <div className="text-yellow-400 bg-yellow-900 px-4 py-1 flex flex-row items-center">
          <AlertTriangle className="h-4 w-4" />
          <span className='ml-2'>
            {' '}
            Your computer doesn&apos;t has a discrete GPU so AI models could run really slow.
          </span>
        </div>
        </>
      )}
    </div>
  );
};
