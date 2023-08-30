import { Button } from '@shinkai_network/shinkai-ui';
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
    <Button
      className="flex flex-1 cursor-pointer flex-col items-start gap-1 rounded-lg p-4 text-left"
      onClick={() => onConnectionMethodOptionClick()}
      size="auto"
      variant="ghost"
    >
      <div className="">{icon}</div>
      <p className="text-[15px] font-medium leading-none">{title}</p>
      <p className="text-xs text-gray-100">{description}</p>
    </Button>
  );
};
