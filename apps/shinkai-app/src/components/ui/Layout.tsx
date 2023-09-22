import "./Layout.css";

import {
  IonContent,
  IonFooter,
  IonHeader,
  IonToolbar,
} from "@ionic/react";
import React from "react";

export const IonHeaderCustom = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <IonHeader className="shadow border-b border-slate-50 dark:border-slate-600 md:border-0 bg-slate-900">
      <IonToolbar class="ion-header-custom" className="mx-auto container">
        {children}
      </IonToolbar>
    </IonHeader>
  );
};
export const IonContentCustom = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <IonContent class="ion-content-custom" fullscreen>
      <div className="container mx-auto mt-4 md:mt-4">{children}</div>
    </IonContent>
  );
};

export const IonFooterCustom = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <IonFooter className="shadow border-t border-slate-50 md:border-0 dark:border-slate-600 ">
      <IonToolbar
        class="ion-toolbar-custom"
        className="container md:rounded-[1.25rem]"
      >
        {children}
      </IonToolbar>
    </IonFooter>
  );
};
