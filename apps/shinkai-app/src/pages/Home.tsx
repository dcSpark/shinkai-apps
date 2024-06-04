import './Home.css';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  IonActionSheet,
  IonAlert,
  IonButton,
  IonButtons,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonTitle,
} from '@ionic/react';
import { SmartInbox } from '@shinkai_network/shinkai-message-ts/models';
import { useUpdateInboxName } from '@shinkai_network/shinkai-node-state/lib/mutations/updateInboxName/useUpdateInboxName';
import { useGetInboxes } from '@shinkai_network/shinkai-node-state/lib/queries/getInboxes/useGetInboxes';
import { addOutline, arrowForward } from 'ionicons/icons';
import { Edit3Icon } from 'lucide-react';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import { z } from 'zod';

import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { IonContentCustom, IonHeaderCustom } from '../components/ui/Layout';
import { useAuth } from '../store/auth';

const updateInboxNameSchema = z.object({
  inboxName: z.string(),
});

const MessageButton = ({ inbox }: { inbox: SmartInbox }) => {
  const history = useHistory();
  const auth = useAuth((state) => state.auth);
  const [isEditable, setIsEditable] = useState(false);
  const updateInboxNameForm = useForm<z.infer<typeof updateInboxNameSchema>>({
    resolver: zodResolver(updateInboxNameSchema),
  });

  const { inboxName: inboxNameValue } = updateInboxNameForm.watch();
  const { mutateAsync: updateInboxName } = useUpdateInboxName();

  const onSubmit = async (data: z.infer<typeof updateInboxNameSchema>) => {
    if (!auth) return;
    await updateInboxName({
      nodeAddress: auth.node_address,
      sender: auth?.shinkai_identity ?? '',
      senderSubidentity: auth?.profile,
      receiver: auth.shinkai_identity,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
      inboxId: inbox.inbox_id,
      inboxName: data.inboxName,
    });
    setIsEditable(false);
  };

  if (isEditable) {
    return (
      <form
        className="flex items-center justify-between gap-2"
        onSubmit={updateInboxNameForm.handleSubmit(onSubmit)}
      >
        <Controller
          control={updateInboxNameForm.control}
          name="inboxName"
          render={({ field }) => (
            <div className="flex-1">
              <IonLabel className="sr-only">Rename inbox name</IonLabel>
              <IonInput
                onIonInput={(e) =>
                  updateInboxNameForm.setValue(
                    'inboxName',
                    e.detail.value as string,
                  )
                }
                placeholder={decodeURIComponent(inbox.custom_name)}
                value={field.value}
              />
            </div>
          )}
        />
        {inboxNameValue ? (
          <Button className="w-auto" type="submit">
            Save
          </Button>
        ) : (
          <Button
            className="w-auto"
            onClick={() => setIsEditable(false)}
            variant="secondary"
          >
            Cancel
          </Button>
        )}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2" key={inbox.inbox_id}>
      <IonItem
        button
        className="ion-item-home"
        onClick={() => {
          const encodedInboxId = inbox.inbox_id.toString().replace(/\./g, '~');
          if (encodedInboxId.startsWith('inbox')) {
            history.push(`/chat/${encodeURIComponent(encodedInboxId)}`);
          } else if (encodedInboxId.startsWith('job_inbox')) {
            history.push(`/job-chat/${encodeURIComponent(encodedInboxId)}`);
          }
        }}
      >
        <Avatar
          className="shrink-0"
          url={`https://ui-avatars.com/api/?name=${inbox.custom_name}&background=FE6162&color=fff`}
        />
        <IonText className="ml-4 font-medium md:text-lg">
          {decodeURIComponent(inbox.custom_name)}
        </IonText>
        <IonIcon className="hidden md:ml-auto md:block" icon={arrowForward} />
      </IonItem>
      <button
        onClick={() => {
          console.log(inbox.inbox_id);
          setIsEditable(true);
        }}
      >
        <Edit3Icon />
      </button>
    </div>
  );
};

const Home: React.FC = () => {
  const auth = useAuth((state) => state.auth);
  const setLogout = useAuth((state) => state.setLogout);

  const { inboxes } = useGetInboxes({
    nodeAddress: auth?.node_address ?? '',
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: auth?.profile ?? '',
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
        <div className="mt-4 flex h-full flex-col">
          <div className="flex-1 space-y-2 md:space-y-4 md:rounded-lg">
            {inboxes?.map((inbox) => (
              <MessageButton inbox={inbox} key={inbox.inbox_id} />
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
      />
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
