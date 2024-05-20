import { buttonVariants } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { OllamaModels } from '../components/shinkai-node-manager/ollama-models';
import { SubpageLayout } from './layout/simple-layout';

const AIModelInstallation = () => {
  return (
    <SubpageLayout
      className="relative flex w-full max-w-6xl flex-col gap-2 px-4"
      title="Install AI"
    >
      <OllamaModels />
      <Link
        className={cn(
          buttonVariants({
            size: 'auto',
          }),
          'absolute right-0 top-9 mx-auto gap-2 px-6 py-2.5',
        )}
        to={{
          pathname: '/',
        }}
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </Link>
    </SubpageLayout>
  );
};

export default AIModelInstallation;
