import React from "react";
import { IonButton } from "@ionic/react";
import { cn } from "../../theme/lib/utils";
import "./Button.css";

export default function Button({
  onClick,
  disabled,
  children,
  className,
  variant = "primary",
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "tertiary";
}) {
  return (
    <IonButton
      className={cn(
        "ion-button-custom w-full",
        "variant-" + variant,
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      shape={"round"}
    >
      {children}
    </IonButton>
  );
}
