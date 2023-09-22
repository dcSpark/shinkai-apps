import './Home.css';

import {
  IonActionSheet,
  IonAlert,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  ApiConfig,
  getAllInboxesForProfile,
} from '@shinkai_network/shinkai-message-ts/api';
import { addOutline, arrowForward } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Avatar from '../components/ui/Avatar';
import { IonContentCustom, IonHeaderCustom } from '../components/ui/Layout';
import { RootState } from '../store';
import { clearStore, receiveAllInboxesForProfile } from '../store/actions';

const Home: React.FC = () => {
  const setupDetails = useSelector((state: RootState) => state.setupDetails);
  const history = useHistory();
  const dispatch = useDispatch();

  const { shinkai_identity, profile, registration_name, permission_type } =
    setupDetails;
  const displayString = (
    <>
      {`${shinkai_identity}/${profile}/device/${registration_name}`}{' '}
      <span className="text-muted text-sm">(Device)</span>
    </>
  );
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const inboxes = useSelector((state: RootState) => state.other.just_inboxes);
  console.log('Inboxes:', inboxes);

  useEffect(() => {
    console.log('Redux State:', setupDetails);
    ApiConfig.getInstance().setEndpoint(setupDetails.node_address);
  }, []);

  useEffect(() => {
    console.log('Redux State:', setupDetails);
    ApiConfig.getInstance().setEndpoint(setupDetails.node_address);

    // Local Identity
    const { shinkai_identity, profile, registration_name } = setupDetails;
    const sender = shinkai_identity;
    const sender_subidentity = `${profile}/device/${registration_name}`;

    // Assuming receiver and target_shinkai_name_profile are the same as sender
    const receiver = sender;
    const target_shinkai_name_profile = `${sender}/${profile}`;

    // TODO: Improve this async call to be react friendly
    getAllInboxesForProfile(
      sender,
      sender_subidentity,
      receiver,
      target_shinkai_name_profile,
      setupDetails
    ).then((inboxes) => dispatch(receiveAllInboxesForProfile(inboxes)));
  }, []);

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
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{displayString}</IonTitle>
          </IonToolbar>
        </IonHeader>
        {/* <ExploreContainer /> */}

        <IonContentCustom>
          <div className="h-full flex flex-col">
            <div className="flex-1 md:rounded-[1.25rem] bg-white dark:bg-slate-800 p-4 md:p-10 space-y-2 md:space-y-4">
              {inboxes &&
                inboxes.map((inbox_name) => (
                  <IonItem
                    button
                    className="ion-item-home"
                    key={inbox_name}
                    onClick={() => {
                      const encodedInboxId = inbox_name
                        .toString()
                        .replace(/\./g, '~');
                      if (encodedInboxId.startsWith('inbox')) {
                        history.push(
                          `/chat/${encodeURIComponent(encodedInboxId)}`
                        );
                      } else if (encodedInboxId.startsWith('job_inbox')) {
                        history.push(
                          `/job-chat/${encodeURIComponent(encodedInboxId)}`
                        );
                      }
                    }}
                  >
                    <Avatar
                      className="shrink-0"
                      url={`https://ui-avatars.com/api/?name=${inbox_name}&background=FE6162&color=fff`}
                    />
                    <IonText className="ml-4 font-bold md:text-lg">
                      {JSON.stringify(inbox_name)}
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
      </IonContent>
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
              dispatch(clearStore());
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
