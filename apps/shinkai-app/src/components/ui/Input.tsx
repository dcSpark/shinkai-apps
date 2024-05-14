import './Input.css';
import './Input.css';

import { InputCustomEvent } from '@ionic/core/dist/types/components/input/input-interface';
import { InputChangeEventDetail, IonInput } from '@ionic/react';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import type { Ref } from 'react';
import React from 'react';

type InputProps = {
  onChange: (event: InputCustomEvent<InputChangeEventDetail>) => void;
  value: string;
  label: string;
  className?: string;
};

const Input = React.forwardRef(
  (
    { onChange, value, label, className }: InputProps,
    ref: Ref<HTMLIonInputElement>,
  ) => {
    return (
      <IonInput
        aria-label={label}
        class={'native-input'}
        className={cn('ion-input-custom', className)}
        fill={'outline'}
        labelPlacement={undefined}
        onIonChange={onChange}
        placeholder={label}
        ref={ref}
        shape={'round'}
        value={value}
      />
    );
  },
);

Input.displayName = 'Input';

export default Input;
