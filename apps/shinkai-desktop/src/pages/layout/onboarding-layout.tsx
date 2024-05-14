import { cn } from '@shinkai_network/shinkai-ui/utils';
import React from 'react';

export type OnboardingLayoutProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLDivElement>
>;

const OnboardingLayout = ({
  children,
  className,
  ...props
}: OnboardingLayoutProps) => {
  return (
    <div
      className={cn('mx-auto grid h-full grid-cols-2', className)}
      {...props}
    >
      <div className="grid place-items-center bg-gray-500 px-8">
        <img
          alt="shinkai logo"
          className="w-full"
          data-cy="shinkai-logo"
          src={'/onboarding.svg'}
        />
      </div>
      <div className="flex flex-col justify-between">
        <img
          alt="shinkai logo"
          className="mx-auto w-28 py-10"
          data-cy="shinkai-logo"
          src={'./visor.svg'}
        />
        <div className="flex-1 px-8 pb-10">{children}</div>
      </div>
    </div>
  );
};
export default OnboardingLayout;
