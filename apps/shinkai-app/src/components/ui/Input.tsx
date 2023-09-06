import { InputCustomEvent } from "@ionic/core/dist/types/components/input/input-interface";
import { InputChangeEventDetail, IonInput, IonItem } from "@ionic/react";
import { cn } from "../../theme/lib/utils";
import React from "react";
import "./Input.css";

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
      shape={"round"}
      fill={"outline"}
      lines={"none"}
    >
      <IonInput
        className="ion-input-custom flex gap-10"
        class={"native-input"}
        value={value}
        onIonChange={onChange}
        labelPlacement={undefined}
        placeholder={label}
        // label={label}
        aria-label={label}
      />
    </IonItem>
  );
}
