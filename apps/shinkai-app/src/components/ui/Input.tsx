import "./Input.css";

import { InputCustomEvent } from "@ionic/core/dist/types/components/input/input-interface";
import { InputChangeEventDetail, IonInput, IonItem } from "@ionic/react";

import { cn } from "../../theme/lib/utils";

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
    <IonItem
      className={cn("ion-input-item-custom", className)}
      fill={"outline"}
      lines={"none"}
      shape={"round"}
    >
      <IonInput
        aria-label={label}
        class={"native-input"}
        className="ion-input-custom flex gap-10"
        labelPlacement={undefined}
        onIonChange={onChange}
        placeholder={label}
        value={value}
      />
    </IonItem>
  );
}
