import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';

import heroImg from '../../../src/assets/icons/permanent-hero.svg';
import logo from '../../../src/assets/icons/visor.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { Button } from '../ui/button';

export default function Welcome() {
  const history = useHistory();
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="grid place-content-center">
        <img
          alt="shinkai logo"
          className="animate-spin-slow h-10 w-20"
          data-cy="shinkai-logo"
          src={srcUrlResolver(logo)}
        />
      </div>
      <div className="flex-1 flex justify-center items-end pb-6">
        <img
          alt="shinkai logo"
          className="animate-spin-slow w-3/4 px-6"
          data-cy="shinkai-logo"
          src={srcUrlResolver(heroImg)}
        />
      </div>
      <p className="text-md text-center py-4 pb-7" data-cy="welcome-message">
        <FormattedMessage id="welcome" />
      </p>
      <Button onClick={() => history.replace('/nodes/connect/method/quick-start')}>
        <FormattedMessage id="setup" />
      </Button>
    </div>
  );
}
