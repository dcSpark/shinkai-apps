import { buttonVariants, Separator } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Link } from 'react-router-dom';

import OnboardingLayout from './layout/onboarding-layout';

const GetStartedPage = () => {
  return (
    <OnboardingLayout>
      <div className="flex h-full flex-col">
        <p className="text-gray-80 text-center text-base tracking-wide">
          Transform your desktop experience using AI with Shinkai Desktop{' '}
          <span aria-hidden> 🔑</span>
        </p>
        <div className="mt-20 flex flex-1 flex-col gap-10">
          <Link
            className={cn(
              buttonVariants({
                size: 'lg',
              }),
              'w-full',
            )}
            state={{ connectionType: 'local' }}
            to={{
              pathname: '/onboarding',
            }}
          >
            Shinkai Private (Local)
          </Link>
          <Separator className="relative" decorative>
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-500 p-2 text-gray-100">
              or
            </span>
          </Separator>
          <div className="space-y-4">
            <a
              className={cn(
                buttonVariants({
                  variant: 'ghost',
                  size: 'lg',
                }),
                'w-full',
              )}
              href="https://www.shinkai.com/sign-in"
              rel="noreferrer"
              target="_blank"
            >
              Log In To Shinkai Hosting
            </a>
            <a
              className={cn(
                buttonVariants({
                  variant: 'ghost',
                  size: 'lg',
                }),
                'w-full',
              )}
              href="https://www.shinkai.com/sign-up?plan=starter"
              rel="noreferrer"
              target="_blank"
            >
              Sign up For Shinkai Hosting
            </a>
            <div className="text-gray-80 items-center space-x-2 text-center text-base">
              <span>Already have an Node?</span>
              <Link
                className="font-semibold text-white underline"
                to="/onboarding"
              >
                Quick Connect
              </Link>
            </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default GetStartedPage;
