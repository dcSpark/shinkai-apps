import { PropsWithChildren } from 'react';

import NavBar from '../nav/nav';

export const WithNav = (props: PropsWithChildren) => {
  return (
    <div className="flex h-full w-full flex-col space-y-8">
      <NavBar />
      <div className="grow overflow-auto">{props.children}</div>
    </div>
  );
};
