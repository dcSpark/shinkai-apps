import './Home.css';

import {
  IonActionSheet,
  IonAlert,
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonPage,
  IonText,
  IonTitle,
} from '@ionic/react';
import { useGetInboxes } from '@shinkai_network/shinkai-node-state/lib/queries/getInboxes/useGetInboxes';
import { addOutline, arrowForward } from 'ionicons/icons';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import Avatar from '../components/ui/Avatar';
import { IonContentCustom, IonHeaderCustom } from '../components/ui/Layout';
import { useAuth } from '../store/auth';

const Home: React.FC = () => {
  const auth = useAuth((state) => state.auth);
  const setLogout = useAuth((state) => state.setLogout);

  const { inboxIds } = useGetInboxes({
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}/device/${auth?.registration_name}`,
    // Assuming receiver and target_shinkai_name_profile are the same as sender
    receiver: auth?.shinkai_identity ?? '',
    targetShinkaiNameProfile: `${auth?.shinkai_identity}/${auth?.profile}`,
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });
  const history = useHistory();

  const { shinkai_identity, profile, registration_name, permission_type } =
    auth ?? {};
  const displayString = (
    <>
      {`${shinkai_identity}/${profile}/device/${registration_name}`}{' '}
      <span className="text-muted text-sm">(Device)</span>
    </>
  );
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  return (
    <IonPage className="bg-slate-900">
      <IonHeaderCustom>
        <IonTitle className="text-center text-inherit">
          {displayString}
        </IonTitle>
        <IonButtons slot="end">
          {' '}
          {/* Add the "+" button to the right side of the toolbar */}
          <IonButton onClick={() => setShowActionSheet(true)}>
            <IonIcon icon={addOutline} slot="icon-only" />
          </IonButton>
        </IonButtons>
      </IonHeaderCustom>
      {/*<IonContent fullscreen>*/}
      {/*<IonHeader collapse="condense">*/}
      {/*  <IonToolbar>*/}
      {/*    <IonTitle size="large">{displayString}</IonTitle>*/}
      {/*  </IonToolbar>*/}
      {/*</IonHeader>*/}
      {/* <ExploreContainer /> */}

      <IonContentCustom>
        <div className="h-full flex flex-col mt-4">
          <div className="flex-1 md:rounded-lg space-y-2 md:space-y-4">
            {inboxIds?.map((inboxId) => (
              <IonItem
                button
                className="ion-item-home"
                key={inboxId}
                onClick={() => {
                  const encodedInboxId = inboxId.toString().replace(/\./g, '~');
                  if (encodedInboxId.startsWith('inbox')) {
                    history.push(`/chat/${encodeURIComponent(encodedInboxId)}`);
                  } else if (encodedInboxId.startsWith('job_inbox')) {
                    history.push(
                      `/job-chat/${encodeURIComponent(encodedInboxId)}`
                    );
                  }
                }}
              >
                <Avatar
                  className="shrink-0"
                  url={`https://ui-avatars.com/api/?name=${inboxId}&background=FE6162&color=fff`}
                />
                <IonText className="ml-4 font-medium md:text-lg">
                  {JSON.stringify(inboxId)}
                </IonText>
                <IonIcon
                  className="hidden md:ml-auto md:block"
                  icon={arrowForward}
                />
              </IonItem>
            ))}
          </div>
        </div>
      </IonContentCustom>
      {/*</IonContent>*/}
      {/* Action Sheet (popup) */}
      <IonActionSheet
        buttons={[
          {
            text: 'Admin Commands',
            role: permission_type !== 'admin' ? 'destructive' : undefined,
            handler: () => {
              if (permission_type === 'admin') {
                history.push('/admin-commands');
              } else {
                console.log('Not authorized for Admin Commands');
              }
            },
          },
          {
            text: 'Create Job',
            handler: () => {
              history.push('/create-job');
            },
          },
          {
            text: 'Create Chat',
            handler: () => {
              history.push('/create-chat');
            },
          },
          {
            text: 'Add Agent',
            handler: () => {
              history.push('/add-agent');
            },
          },
          {
            text: 'Logout',
            role: 'destructive',
            handler: () => {
              setShowLogoutAlert(true);
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            },
          },
        ]}
        className="ion-actionSheet-custom"
        isOpen={showActionSheet}
        onDidDismiss={() => setShowActionSheet(false)}
      ></IonActionSheet>
      <IonAlert
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            },
          },
          {
            text: 'Yes',
            handler: () => {
              setLogout();
              history.push('/connect');
            },
          },
        ]}
        header={'Confirm'}
        isOpen={showLogoutAlert}
        message={
          'Are you sure you want to logout? This will clear all your data.'
        }
        onDidDismiss={() => setShowLogoutAlert(false)}
      />
    </IonPage>
  );
};

export default Home;
