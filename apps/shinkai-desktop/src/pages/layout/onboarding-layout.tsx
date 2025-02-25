import {
  shinkaiOctopusImg,
  shinkaiOctopusVideo,
} from '@shinkai_network/shinkai-ui/assets';
import { useReverseVideoPlayback } from '@shinkai_network/shinkai-ui/hooks';
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
      <div className="flex h-[calc(100dvh-100px)] items-center justify-center">
        <div className="mx-auto flex h-[600px] w-full max-w-lg flex-col gap-10">
          <img
            alt="shinkai logo"
            className="w-24"
            data-cy="shinkai-logo"
            src={'./visor.svg'}
          />
          <div className="flex-1">{children}</div>
        </div>
      </div>
      <div className="grid h-full place-items-center">
        <div className="relative size-full">
          <div className="absolute left-10 z-10 flex aspect-square size-full items-center object-left bg-blend-darken">
            <img
              alt="shinkai logo"
              className="size-full max-h-[70vh] object-cover object-left"
              data-cy="onboarding-logo"
              src={'./onboarding.png'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default OnboardingLayout;
