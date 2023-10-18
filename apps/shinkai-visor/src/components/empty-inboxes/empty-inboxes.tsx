import { Workflow } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import logo from '../../../src/assets/icons/shinkai-min.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { Button } from '../ui/button';

export const EmptyInboxes = () => {
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
          <FormattedMessage id="empty-inboxes-title" />
        </p>
        <p className="text-sm text-center">
          <FormattedMessage id="empty-inboxes-message" />
        </p>
      </div>

      <Button
        className="w-full"
        onClick={() => history.push('/inboxes/create-job')}
      >
        <Workflow className="w-4 h-4 mr-2" />
        <FormattedMessage id="create-job" />
      </Button>
    </div>
  );
};
