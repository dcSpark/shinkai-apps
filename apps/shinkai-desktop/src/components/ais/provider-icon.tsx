import { AisIcon } from '@shinkai_network/shinkai-ui/assets';
import { useMemo } from 'react';

import { type ModelProviderKey, providerMappings } from './constants';

export interface ProviderIconProps {
  className?: string;
  provider?: ModelProviderKey | string;
  ref?: React.RefObject<HTMLDivElement | null>;
}

const ProviderIcon = ({
  provider: originProvider,
  ref,
  ...rest
}: ProviderIconProps) => {
  const Icon = useMemo(() => {
    if (!originProvider) return AisIcon;
    const provider = originProvider.toLowerCase();
    if (providerMappings[provider as ModelProviderKey]) {
      return providerMappings[provider as ModelProviderKey];
    }
    return AisIcon;
  }, [originProvider]);

  const props = {
    ...rest,
    ref,
  };

  return <Icon {...props} />;
};

ProviderIcon.displayName = 'ProviderIcon';

export default ProviderIcon;
