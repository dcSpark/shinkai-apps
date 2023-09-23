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
import { submitRequestRegistrationCode } from '@shinkai_network/shinkai-message-ts/api';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../components/ui/Button';
import { IonContentCustom, IonHeaderCustom } from '../components/ui/Layout';
import Modal from '../components/ui/Modal';
import { useSetup } from '../hooks/usetSetup';
import { RootState } from '../store';
import { createRegistrationCode } from '../store/actions';

const AdminCommands: React.FC = () => {
  useSetup();
  const setupDetailsState = useSelector(
    (state: RootState) => state.setupDetails
  );
  const [showCodeRegistrationActionSheet, setShowCodeRegistrationActionSheet] =
    useState(false);
  const [showCodeRegistrationModal, setCodeRegistrationShowModal] =
    useState(false);
  const [showIdentityTypeActionSheet, setShowIdentityTypeActionSheet] =
    useState(false);
  const [identityType, setIdentityType] = useState('');
  const [profileName, setProfileName] = useState('');
  const dispatch = useDispatch();
  const registrationCode = useSelector(
    (state: RootState) => state.other.registrationCode
  );
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
    let finalCodeType = identityType;
    if (identityType === 'device') {
      // Serialize permissionsType as "device:PROFILE_NAME" when "Device" is selected
      finalCodeType = `device:${profileName}`;
    }
    const code = await submitRequestRegistrationCode(
      permissionsType,
      finalCodeType,
      setupDetailsState as any
    );
    dispatch(createRegistrationCode(code));
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
