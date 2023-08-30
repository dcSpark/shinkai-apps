import { ReactNode } from 'react';

export type HeaderProps = {
  title: ReactNode | string;
  description?: ReactNode | string;
};

export const Header = ({ title, description }: HeaderProps) => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      {description && <p className="text-xs text-gray-100">{description}</p>}
    </div>
  );
};
