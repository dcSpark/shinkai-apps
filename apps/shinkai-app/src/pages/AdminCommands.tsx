import {
  IonActionSheet,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { submitRequestRegistrationCode } from "@shinkai_network/shinkai-message-ts/api";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useSetup } from "../hooks/usetSetup";
import { RootState } from "../store";
import { createRegistrationCode } from "../store/actions";

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
  const [identityType, setIdentityType] = useState("");
  const [profileName, setProfileName] = useState("");
  const dispatch = useDispatch();
  const registrationCode = useSelector(
    (state: RootState) => state.other.registrationCode
  );
  const commands = [
    "Get Peers",
    "Ping All",
    "Connect To",
    "Get Last Messages",
    "Create Registration Code",
    "Get All Subidentities",
  ];

  const handleCommandClick = (command: string) => {
    console.log(`Command selected: ${command}`);

    if (command === "Create Registration Code") {
      setShowIdentityTypeActionSheet(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(registrationCode);
  };

  const handleIdentityTypeClick = (type: string) => {
    setIdentityType(type);
    setShowIdentityTypeActionSheet(false);
    if (type === "device") {
      // Prompt the user to enter a profile name when "Device" is selected
      const profile = prompt("Please enter a profile name");
      setProfileName(profile || "");
    }
    if (type !== "Cancel") {
      setShowCodeRegistrationActionSheet(true);
    }
  };

  const handleIdentityClick = async (permissionsType: string) => {
    let finalCodeType = identityType;
    if (identityType === "device") {
      // Serialize permissionsType as "device:PROFILE_NAME" when "Device" is selected
      finalCodeType = `device:${profileName}`;
    }
    const code = await submitRequestRegistrationCode(permissionsType, finalCodeType, setupDetailsState as any);
    dispatch(createRegistrationCode(code));
    setCodeRegistrationShowModal(true);
    return true;
  };

  return (
    <>
      <IonActionSheet
        buttons={[
          {
            text: "Profile",
            handler: () => handleIdentityTypeClick("profile"),
          },
          {
            text: "Device",
            handler: () => handleIdentityTypeClick("device"),
          },
          {
            text: "Cancel",
            role: "cancel",
            handler: () => handleIdentityTypeClick("Cancel"),
          },
        ]}
        isOpen={showIdentityTypeActionSheet}
        onDidDismiss={() => setShowIdentityTypeActionSheet(false)}
      />
      <IonActionSheet
        buttons={[
          {
            text: "Admin",
            handler: () => handleIdentityClick("admin"),
          },
          {
            text: "Standard",
            handler: () => handleIdentityClick("standard"),
          },
          {
            text: "None",
            handler: () => handleIdentityClick("none"),
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]}
        isOpen={showCodeRegistrationActionSheet}
        onDidDismiss={() => setShowCodeRegistrationActionSheet(false)}
      />
      <IonModal isOpen={showCodeRegistrationModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Code Registration Successful</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonLabel>Code: {registrationCode}</IonLabel>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <IonButton
              onClick={copyToClipboard}
              style={{ marginRight: "10px" }}
            >
              Copy
            </IonButton>
            <IonButton onClick={() => setCodeRegistrationShowModal(false)}>
              Dismiss
            </IonButton>
          </div>
        </IonContent>
      </IonModal>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>Admin Commands</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
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
        </IonContent>
      </IonPage>
    </>
  );
};

export default AdminCommands;
