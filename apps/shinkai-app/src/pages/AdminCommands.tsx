import {
  IonActionSheet,
  IonBackButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
} from '@ionic/react';
import { useCreateRegistrationCode } from '@shinkai_network/shinkai-node-state/lib/mutations/createRegistrationCode/useCreateRegistrationCode';
import React, { useState } from 'react';

import Button from '../components/ui/Button';
import { IonContentCustom, IonHeaderCustom } from '../components/ui/Layout';
import Modal from '../components/ui/Modal';
import { useAuth } from '../store/auth';

const AdminCommands: React.FC = () => {
  const auth = useAuth((state) => state.auth);

  const [showCodeRegistrationActionSheet, setShowCodeRegistrationActionSheet] =
    useState(false);
  const [showCodeRegistrationModal, setCodeRegistrationShowModal] =
    useState(false);
  const [showIdentityTypeActionSheet, setShowIdentityTypeActionSheet] =
    useState(false);
  const [identityType, setIdentityType] = useState('');
  const [profileName, setProfileName] = useState('');

  const [registrationCode, setRegistrationCode] = useState('');

  const { mutateAsync: createRegistrationCode } = useCreateRegistrationCode({
    onSuccess: (data) => {
      setRegistrationCode(data);
    },
  });
  const commands = [
    'Get Peers',
    'Ping All',
    'Connect To',
    'Get Last Messages',
    'Create Registration Code',
    'Get All Subidentities',
  ];

  const handleCommandClick = (command: string) => {
    console.log(`Command selected: ${command}`);

    if (command === 'Create Registration Code') {
      setShowIdentityTypeActionSheet(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(registrationCode);
  };

  const handleIdentityTypeClick = (type: string) => {
    setIdentityType(type);
    setShowIdentityTypeActionSheet(false);
    if (type === 'device') {
      // Prompt the user to enter a profile name when "Device" is selected
      const profile = prompt('Please enter a profile name');
      setProfileName(profile || '');
    }
    if (type !== 'Cancel') {
      setShowCodeRegistrationActionSheet(true);
    }
  };

  const handleIdentityClick = async (permissionsType: string) => {
    if (!auth) return;
    await createRegistrationCode({
      nodeAddress: auth.node_address,
      permissionsType,
      identityType,
      setupPayload: {
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        registration_code: auth.registration_code ?? '',
        identity_type: auth.identity_type ?? '',
        permission_type: auth.permission_type,
        registration_name: auth.registration_name,
        profile: auth.profile,
        shinkai_identity: auth.shinkai_identity,
        node_address: auth.node_address,
      },
      profileName,
    });

    setCodeRegistrationShowModal(true);
    return true;
  };

  return (
    <>
      <IonActionSheet
        buttons={[
          {
            text: 'Profile',
            handler: () => handleIdentityTypeClick('profile'),
          },
          {
            text: 'Device',
            handler: () => handleIdentityTypeClick('device'),
          },
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => handleIdentityTypeClick('Cancel'),
          },
        ]}
        className="ion-actionSheet-custom"
        isOpen={showIdentityTypeActionSheet}
        onDidDismiss={() => setShowIdentityTypeActionSheet(false)}
      />
      <IonActionSheet
        buttons={[
          {
            text: 'Admin',
            handler: () => handleIdentityClick('admin'),
          },
          {
            text: 'Standard',
            handler: () => handleIdentityClick('standard'),
          },
          {
            text: 'None',
            handler: () => handleIdentityClick('none'),
          },
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ]}
        className="ion-actionSheet-custom"
        isOpen={showCodeRegistrationActionSheet}
        onDidDismiss={() => setShowCodeRegistrationActionSheet(false)}
      />
      <Modal
        content={
          <div className="p-6 md:py-8">
            <IonLabel className={'text-slate-700 dark:text-white '}>
              Code: {registrationCode}
            </IonLabel>
            <div className={'flex flex-col gap-4 md:flex-row md:gap-6 mt-5 '}>
              <Button onClick={copyToClipboard}>Copy</Button>
              <Button
                onClick={() => setCodeRegistrationShowModal(false)}
                variant={'secondary'}
              >
                Dismiss
              </Button>
            </div>
          </div>
        }
        header={'Code Registration Successful'}
        isOpen={showCodeRegistrationModal}
      />
      <IonPage>
        <IonHeaderCustom>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Admin Commands</IonTitle>
        </IonHeaderCustom>
        <IonContentCustom>
          <IonList className="ion-list-chat p-0 divide-y divide-slate-200 dark:divide-slate-500/50 md:rounded-[1.25rem]  ">
            {commands.map((command) => (
              <IonItem
                button
                key={command}
                onClick={() => handleCommandClick(command)}
              >
                <IonLabel>{command}</IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonContentCustom>
      </IonPage>
    </>
  );
};

export default AdminCommands;
