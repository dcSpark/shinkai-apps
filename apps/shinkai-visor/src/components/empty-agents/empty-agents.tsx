import { Bot } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import logo from '../../../src/assets/icons/shinkai-min.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { Button } from '../ui/button';

export const EmptyAgents = () => {
  const history = useHistory();
  return (
    <div className="grow flex flex-col justify-center">
      <div className="space-y-3 text-center mb-6">
        <div className="grid place-content-center">
          <img
            alt="shinkai logo"
            className="animate-spin-slow h-16 w-h-16"
            data-cy="shinkai-logo"
            src={srcUrlResolver(logo)}
          />
        </div>
        <p className="text-lg font-semibold">
          <FormattedMessage id="empty-agents-title" />
        </p>
        <p className="text-sm text-center">
          <FormattedMessage id="empty-agents-message" />
        </p>
      </div>

      <Button className="" onClick={() => history.push('/agents/add')}>
        <Bot className="w-4 h-4 mr-2" />
        <FormattedMessage id="add-agent" />
      </Button>
    </div>
  );
};
