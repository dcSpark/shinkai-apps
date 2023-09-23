import './Input.css';
import './Input.css';

import { InputCustomEvent } from '@ionic/core/dist/types/components/input/input-interface';
import { InputChangeEventDetail, IonInput } from '@ionic/react';

import { cn } from '../../theme/lib/utils';

export default function Input({
  onChange,
  value,
  label,
  className,
}: {
  onChange: (event: InputCustomEvent<InputChangeEventDetail>) => void;
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <IonInput
      aria-label={label}
      class={'native-input'}
      className={cn('ion-input-custom', className)}
      fill={'outline'}
      labelPlacement={undefined}
      onIonChange={onChange}
      placeholder={label}
      shape={'round'}
      value={value}
    />
  );
}
