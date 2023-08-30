import { buttonVariants, Checkbox } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import OnboardingLayout from './layout/onboarding-layout';

const TermsAndConditionsPage = () => {
  const [acceptedTermsAndContidions, setAcceptedTermsAndContidions] = useState<
    boolean | 'indeterminate'
  >(false);

  return (
    <OnboardingLayout>
      <div className="flex h-full flex-col justify-between">
        <p className="text-center text-3xl font-medium leading-[1.5] tracking-wide ">
          Transform your desktop experience using AI with Shinkai Desktop{' '}
          <span aria-hidden> 🔑</span>
        </p>
        <div className="">
          <div className="flex flex-col gap-10">
            <div className="flex gap-3">
              <Checkbox
                checked={acceptedTermsAndContidions}
                id="terms"
                onCheckedChange={setAcceptedTermsAndContidions}
              />
              <label
                className="inline-block cursor-pointer text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="terms"
              >
                <span className={'leading-4 tracking-wide'}>
                  I agree to our{' '}
                  <a
                    className={'text-white underline'}
                    href={'https://www.shinkai.com/terms-of-service'}
                    rel="noreferrer"
                    target={'_blank'}
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    className={'text-white underline'}
                    href={'https://www.shinkai.com/privacy-policy'}
                    rel="noreferrer"
                    target={'_blank'}
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>
            <Link
              className={cn(
                buttonVariants({
                  variant: 'default',
                }),
                !acceptedTermsAndContidions &&
                  'pointer-events-none bg-gray-300 opacity-60',
              )}
              to={'/get-started'}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default TermsAndConditionsPage;
