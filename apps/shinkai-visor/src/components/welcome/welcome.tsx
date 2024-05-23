import { Button, Checkbox } from '@shinkai_network/shinkai-ui';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import logo from '../../../src/assets/icons/visor.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';

export default function Welcome() {
  const navigate = useNavigate();
  const [acceptedTermsAndContidions, setAcceptedTermsAndContidions] = useState<
    boolean | 'indeterminate'
  >(false);
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div>
        <div className="mb-4 grid place-content-center">
          <img
            alt="shinkai logo"
            className="animate-spin-slow w-[100px]"
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
      <div className="flex items-start space-x-2">
        <Checkbox
          checked={acceptedTermsAndContidions}
          data-testid="terms"
          id="terms"
          onCheckedChange={setAcceptedTermsAndContidions}
        />
        <label
          className="inline-block cursor-pointer text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="terms"
        >
          <span className={'leading-4 tracking-wide'}>
            By continuing, you agree to our{' '}
            <a
              className={'text-blue-400 underline'}
              data-testid="terms-of-service-link"
              href={'https://www.shinkai.com/terms-of-service'}
              rel="noreferrer"
              target={'_blank'}
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              className={'text-blue-400 underline'}
              data-testid="privacy-policy-link"
              href={'https://www.shinkai.com/privacy-policy'}
              rel="noreferrer"
              target={'_blank'}
            >
              Privacy Policy
            </a>
          </span>
        </label>
      </div>

      <Button
        data-testid="get-started-button"
        disabled={!acceptedTermsAndContidions}
        onClick={() => navigate('/nodes/connect/method/quick-start')}
      >
        <FormattedMessage id="setup" />
      </Button>
    </div>
  );
}
