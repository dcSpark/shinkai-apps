import { PropsWithChildren } from 'react';

import NavBar from '../components/nav/nav';
import { NavBreadcrumb } from '../components/nav-breadcrumb/nav-breadcrumb';

export const WithNav = (props: PropsWithChildren) => {
  return (
    <div className="h-full flex flex-col space-y-5">
      <NavBar />
      <NavBreadcrumb></NavBreadcrumb>
      <div className="grow overflow-auto">{props.children}</div>
    </div>
  );
};
