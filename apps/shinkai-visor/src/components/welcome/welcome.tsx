import { Button } from '@shinkai_network/shinkai-ui';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';

import logo from '../../../src/assets/icons/visor.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';

export default function Welcome() {
  const history = useHistory();
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="grid place-content-center">
        <img
          alt="shinkai logo"
          className="animate-spin-slow h-10 w-20"
          data-cy="shinkai-logo"
          src={srcUrlResolver(logo)}
        />
      </div>
      <div className="-ml-4 -mr-4 pb-6">
        <img
          alt="shinkai logo"
          className="animate-spin-slow w-full"
          data-cy="shinkai-logo"
          src={'/welcome.jpg'}
        />
      </div>
      <p className="text-md py-4 pb-7 text-center" data-cy="welcome-message">
        <FormattedMessage id="welcome" />
      </p>
      <Button
        onClick={() => history.replace('/nodes/connect/method/quick-start')}
      >
        <FormattedMessage id="setup" />
      </Button>
    </div>
  );
}
