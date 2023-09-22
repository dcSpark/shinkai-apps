import "./Button.css";

import { IonButton } from "@ionic/react";
import React from "react";

import { cn } from "../../theme/lib/utils";

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
      disabled={disabled}
      onClick={onClick}
      shape={"round"}
    >
      {children}
    </IonButton>
  );
}
