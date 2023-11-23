import { ReactNode } from 'react';

export type HeaderProps = {
  icon: ReactNode;
  title: ReactNode | string;
  description?: ReactNode | string;
};

export const Header = ({ icon, title, description }: HeaderProps) => {
  return (
    <div className="flex flex-col space-y-1">
      <div className="text-2xl font-semibold text-white">{title}</div>
      {description && (
        <span className="text-xs text-gray-100">{description}</span>
      )}
    </div>
  );
};
