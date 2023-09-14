import { PropsWithChildren } from 'react';

import NavBar from '../components/nav/nav';

export const WithNav = (props: PropsWithChildren) => {
  return (
    <div className="h-full flex flex-col space-y-5">
      <NavBar />
      <div className="grow overflow-auto">{props.children}</div>
    </div>
  );
};
