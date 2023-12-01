import React from 'react';

const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto grid h-full grid-cols-2">
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
          className="w-30 mx-auto py-10"
          data-cy="shinkai-logo"
          src={'./visor.svg'}
        />
        <div className="flex-1 px-8 pb-10">{children}</div>
      </div>
    </div>
  );
};
export default OnboardingLayout;
