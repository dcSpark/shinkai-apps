import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';

import logo from '../../../src/assets/icons/shinkai-min.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { Button } from '../ui/button';

export default function Welcome() {
  const history = useHistory();
  return (
    <div className="h-full flex flex-col justify-between">
      <p className="text-lg" data-cy="welcome-message">
        <FormattedMessage id="welcome" />
      </p>
      <div className="grid place-content-center">
        <img
          alt="shinkai logo"
          className="animate-spin-slow h-20 w-20"
          data-cy="shinkai-logo"
          src={srcUrlResolver(logo)}
        />
      </div>
      <Button onClick={() => history.push('/nodes/add')}>
        <FormattedMessage id="setup" />
      </Button>
    </div>
  );
}
