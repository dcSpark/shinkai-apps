import { InputCustomEvent } from "@ionic/core/dist/types/components/input/input-interface";
import { InputChangeEventDetail, IonInput } from "@ionic/react";
import { cn } from "../../theme/lib/utils";
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
    <IonInput
      className={cn("ion-input-custom", className)}
      class={"native-input"}
      value={value}
      shape={"round"}
      onIonChange={onChange}
      labelPlacement={undefined}
      placeholder={label}
      fill={"outline"}
      aria-label={label}
    />
  );
}
