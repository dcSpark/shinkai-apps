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
  const videoRef = useReverseVideoPlayback();

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
      <div className="grid h-full place-items-center overflow-hidden">
        <div className="relative aspect-square w-[800px] p-20">
          <div className="absolute bottom-3 right-3.5 z-10 h-4 w-11 bg-[#141419] bg-blend-darken" />
          <video
            autoPlay
            className="absolute inset-0 -left-[10%] top-1/2 w-full !max-w-[initial] -translate-y-1/2 mix-blend-screen"
            muted
            playsInline
            poster={shinkaiOctopusImg}
            // loop
            ref={videoRef}
            src={shinkaiOctopusVideo}
          />
        </div>
      </div>
    </div>
  );
};
export default OnboardingLayout;
