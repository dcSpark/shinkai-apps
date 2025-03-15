import { AisIcon } from '@shinkai_network/shinkai-ui/assets';
import { forwardRef, useMemo } from 'react';

import { ModelProviderKey, providerMappings } from './constants';

export interface ProviderIconProps {
  className?: string;
  provider?: ModelProviderKey | string;
}

const ProviderIcon = forwardRef<any, ProviderIconProps>(
  ({ provider: originProvider, ...rest }, ref) => {
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
  },
);

ProviderIcon.displayName = 'ProviderIcon';

export default ProviderIcon;
