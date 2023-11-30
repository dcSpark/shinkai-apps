import React from 'react';

const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto flex h-full">
      <div className="bg-app-gradient grid flex-1 place-items-center">
        <img
          alt="shinkai logo"
          className="w-full"
          data-cy="shinkai-logo"
          src={'/welcome.jpg'}
        />
      </div>
      <div className="flex flex-1 flex-col justify-between">
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
