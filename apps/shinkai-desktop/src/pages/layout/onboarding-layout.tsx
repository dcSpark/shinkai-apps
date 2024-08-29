import { shinkaiOctopusImg } from '@shinkai_network/shinkai-ui/assets';
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
      className={cn(
        'bg-black-gradient mx-auto grid h-full grid-cols-2 flex-col-reverse items-center px-[48px]',
        className,
      )}
      {...props}
    >
      <div className="bg-onboarding-card flex h-[calc(100dvh-100px)] items-center rounded-2xl border-[#252528] px-[50px] py-[80px]">
        <div className="flex h-full w-full flex-col gap-10">
          <img
            alt="shinkai logo"
            className="w-28"
            data-cy="shinkai-logo"
            src={'./visor.svg'}
          />
          <div className="flex-1">{children}</div>
        </div>
      </div>
      <div className="relative grid place-items-center">
        <img
          alt="shinkai octopus"
          className="absolute w-[65vw] !max-w-[initial] mix-blend-screen"
          src={shinkaiOctopusImg}
        />
      </div>
    </div>
  );
};
export default OnboardingLayout;
