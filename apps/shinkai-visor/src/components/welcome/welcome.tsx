import { Button } from '@shinkai_network/shinkai-ui';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';

import logo from '../../../src/assets/icons/visor.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';

export default function Welcome() {
  const history = useHistory();
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div>
        <div className="grid place-content-center ">
          <img
            alt="shinkai logo"
            className="animate-spin-slow h-10 w-20"
            data-cy="shinkai-logo"
            src={srcUrlResolver(logo)}
          />
        </div>
        <div className="-ml-6 -mr-6 pt-1">
          <img
            alt="shinkai logo"
            className="animate-spin-slow w-full"
            data-cy="shinkai-logo"
            src={'/welcome.jpg'}
          />
        </div>
        <p className="text-2xl font-semibold" data-cy="welcome-message">
          <FormattedMessage id="welcome" />
        </p>
      </div>
      <Button
        onClick={() => history.replace('/nodes/connect/method/quick-start')}
      >
        <FormattedMessage id="setup" />
      </Button>
      <p className="text-center">
        <span className="block">By continuing, you agree to our</span>
        <span>
          <a
            className={'px-1 text-blue-400 underline'}
            href={'https://www.shinkai.com/terms-of-service'}
            rel="noreferrer"
            target={'_blank'}
          >
            Terms of Service
          </a>
          <span>and</span>
          <a
            className={'px-1 text-blue-400 underline'}
            href={'https://www.shinkai.com/privacy-policy'}
            rel="noreferrer"
            target={'_blank'}
          >
            Privacy Policy
          </a>
        </span>
      </p>
    </div>
  );
}
