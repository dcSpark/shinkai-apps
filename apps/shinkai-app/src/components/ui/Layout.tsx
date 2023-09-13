import React from 'react';
import {
  IonContent,
  IonFooter,
  IonHeader,
  IonToolbar,
  ScrollDetail,
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
    {
      children,
      onScroll,
    }: {
      children: React.ReactNode;
      onScroll?: (e: CustomEvent<ScrollDetail>) => void;
    },
    ref?: React.Ref<HTMLIonContentElement>
  ) => {
    return (
      <IonContent
        fullscreen
        class="ion-content-custom"
        ref={ref}
        scrollEvents={true}
        onIonScroll={onScroll}
      >
        <div className="container mx-auto min-h-full px-6">{children}</div>
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
    <IonFooter className="shadow-none bg-white dark:bg-slate-900">
      <IonToolbar className="container" class="ion-toolbar-custom">
        {children}
      </IonToolbar>
    </IonFooter>
  );
};
