import { ReactNode } from 'react';

export type HeaderProps = {
  icon: ReactNode;
  title: ReactNode | string;
  description?: ReactNode | string;
};

export const Header = ({ icon, title, description }: HeaderProps) => {
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex flex-row space-x-1 items-center">
        <span className="shrink-0">
          {icon}
        </span>
        <div className="font-semibold text-lg">{title}</div>
      </div>
      {description && <span className="text-xs">{description}</span>}
    </div>
  );
};
