import React from 'react';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import './Layout.css';

export const IonHeaderCustom = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <IonHeader className="shadow border-b border-slate-50 dark:border-slate-700 md:border-0 md:shadow-none">
      <IonToolbar className="mx-auto container" class="ion-header-custom">
        {children}
      </IonToolbar>
    </IonHeader>
  );
};
export const IonContentCustom = React.forwardRef(
  (
    { children }: { children: React.ReactNode },
    ref?: React.Ref<HTMLIonContentElement>
  ) => {
    return (
      <IonContent fullscreen class="ion-content-custom" ref={ref}>
        <div className="container mx-auto min-h-full">{children}</div>
      </IonContent>
    );
  }
);

export const IonFooterCustom = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <IonFooter className="shadow border-t border-slate-50 md:border-0 dark:border-slate-600 ">
      <IonToolbar
        className="container md:rounded-[1.25rem]"
        class="ion-toolbar-custom"
      >
        {children}
      </IonToolbar>
    </IonFooter>
  );
};
