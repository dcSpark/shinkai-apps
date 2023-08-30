import './Button.css';

import { IonButton } from '@ionic/react';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

export default function Button({
  onClick,
  disabled,
  children,
  className,
  variant = 'primary',
  type = 'button',
  isLoading,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
}) {
  return (
    <IonButton
      className={cn(
        'ion-button-custom w-full',
        'variant-' + variant,
        className,
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
      shape={'round'}
      type={type}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </IonButton>
  );
}
