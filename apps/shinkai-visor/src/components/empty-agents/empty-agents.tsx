import { Button } from '@shinkai_network/shinkai-ui';
import { Bot } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import logo from '../../../src/assets/icons/shinkai-min.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';

export const EmptyAgents = () => {
  const history = useHistory();
  return (
    <div className="flex grow flex-col justify-center">
      <div className="mb-6 space-y-3 text-center">
        <div className="grid place-content-center">
          <img
            alt="shinkai logo"
            className="animate-spin-slow w-h-16 h-16"
            data-cy="shinkai-logo"
            src={srcUrlResolver(logo)}
          />
        </div>
        <p className="text-lg font-semibold">
          <FormattedMessage id="empty-agents-title" />
        </p>
        <p className="text-center text-sm">
          <FormattedMessage id="empty-agents-message" />
        </p>
      </div>

      <Button className="" onClick={() => history.push('/agents/add')}>
        <Bot className="mr-2 h-4 w-4" />
        <FormattedMessage id="add-agent" />
      </Button>
    </div>
  );
};
