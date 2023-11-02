import { ReactNode } from 'react';

export type ConnectionMethodOptionProps = {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  onClick?: () => void;
};

export const ConnectionMethodOption = ({
  icon,
  title,
  description,
  onClick,
}: ConnectionMethodOptionProps) => {
  const onConnectionMethodOptionClick = () => {
    if (typeof onClick === 'function') {
      onClick();
    }
  };
  return (
    <div
      className="group flex items-center space-x-2 rounded-md border p-2 cursor-pointer hover:bg-secondary-600"
      onClick={() => onConnectionMethodOptionClick()}
    >
      <div className="group-hover:animate-bounce">{icon}</div>
      <div className="flex-1 space-y-1">
        <p className="text-xs font-medium leading-none">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
