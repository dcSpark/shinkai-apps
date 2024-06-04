import './Layout.css';

import {
  IonContent,
  IonFooter,
  IonHeader,
  IonToolbar,
  ScrollDetail,
} from '@ionic/react';
import React from 'react';

export const IonHeaderCustom = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <IonHeader className="shadow border-b border-slate-50 dark:border-slate-700 md:border-0 md:shadow-none">
      <IonToolbar class="ion-header-custom" className="mx-auto container">
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
    ref?: React.Ref<HTMLIonContentElement>,
  ) => {
    return (
      <IonContent
        class="ion-content-custom"
        fullscreen
        onIonScroll={onScroll}
        ref={ref}
        scrollEvents={true}
      >
        <div className="container mx-auto min-h-full px-6">{children}</div>
      </IonContent>
    );
  },
);
IonContentCustom.displayName = 'IonContentCustom';

export const IonFooterCustom = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <IonFooter className="shadow-none bg-white dark:bg-slate-900">
      <IonToolbar class="ion-toolbar-custom" className="container">
        {children}
      </IonToolbar>
    </IonFooter>
  );
};
