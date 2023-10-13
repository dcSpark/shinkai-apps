import './Button.css';

import { IonButton } from '@ionic/react';
import { Loader } from 'lucide-react';
import React from 'react';

import { cn } from '../../theme/lib/utils';

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
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
      shape={'round'}
      type={type}
    >
      {isLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
      {children}
    </IonButton>
  );
}
