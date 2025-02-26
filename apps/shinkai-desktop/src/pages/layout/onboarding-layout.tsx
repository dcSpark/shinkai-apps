import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import React from 'react';
import { Outlet } from 'react-router-dom';

import { ONBOARDING_STEPS } from '../../components/onboarding/constants';
import { useSettings } from '../../store/settings';

export type OnboardingLayoutProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLDivElement>
>;

const OnboardingLayout = ({ className, ...props }: OnboardingLayoutProps) => {
  const currentStep = useSettings((state) => state.getCurrentStep());
  return (
    <div
      className={cn(
        'bg-black-gradient mx-auto grid h-full grid-cols-2 flex-col-reverse items-center px-[48px]',
        className,
      )}
      {...props}
    >
      <div className="flex h-[calc(100dvh-100px)] items-center justify-center">
        <div className="mx-auto flex h-[600px] w-full max-w-lg flex-col gap-12">
          <div
            className={cn(
              'flex w-full items-center justify-between',
              currentStep !== 1 && 'justify-center',
            )}
          >
            {currentStep === 1 && (
              <img
                alt="shinkai logo"
                className="w-24"
                data-cy="shinkai-logo"
                src={'./visor.svg'}
              />
            )}
            {currentStep !== 1 && (
              <Stepper
                className="max-w-[150px] items-start gap-4"
                value={currentStep as number}
              >
                {ONBOARDING_STEPS.map((item, idx) => (
                  <StepperItem className="flex-1" key={item.id} step={idx + 1}>
                    <StepperTrigger
                      className="w-full flex-col items-start gap-2"
                      disabled
                    >
                      <StepperIndicator
                        asChild
                        className="bg-official-gray-800 h-1 w-full"
                      >
                        <span className="sr-only">{idx}</span>
                      </StepperIndicator>
                    </StepperTrigger>
                  </StepperItem>
                ))}
              </Stepper>
            )}
          </div>
          <div className="flex-1">
            <Outlet />
          </div>
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
