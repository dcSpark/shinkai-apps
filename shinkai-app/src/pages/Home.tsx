import {
  IonActionSheet,
  IonAlert,
  IonAvatar,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { addOutline, arrowForward, cloudUpload } from "ionicons/icons";
import "./Home.css";
import { useHistory } from "react-router-dom";
import { RootState } from "../store";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import { ApiConfig } from "../api/api_config";
import { clearStore } from "../store/actions";
import { getAllInboxesForProfile } from "../api";
import Avatar from "../components/ui/Avatar";
import { IonContentCustom, IonHeaderCustom } from "../components/ui/Layout";

const Home: React.FC = () => {
  const { setupDetailsState } = useSelector((state: RootState) => state);
  const history = useHistory();
  const dispatch = useDispatch();

  const { shinkai_identity, profile, registration_name, permission_type } =
    setupDetailsState;
  const displayString = (
    <>
      {`${shinkai_identity}/${profile}/device/${registration_name}`}{" "}
      <span className="text-muted text-sm">(Device)</span>
    </>
  );
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const inboxes = useSelector((state: RootState) => state.inboxes);
  console.log("Inboxes:", inboxes);

  useEffect(() => {
    console.log("Redux State:", setupDetailsState);
    ApiConfig.getInstance().setEndpoint(setupDetailsState.node_address);
  }, []);

  useEffect(() => {
    console.log("Redux State:", setupDetailsState);
    ApiConfig.getInstance().setEndpoint(setupDetailsState.node_address);

    // Local Identity
    const { shinkai_identity, profile, registration_name } = setupDetailsState;
    let sender = shinkai_identity;
    let sender_subidentity = `${profile}/device/${registration_name}`;

    // Assuming receiver and target_shinkai_name_profile are the same as sender
    let receiver = sender;
    let target_shinkai_name_profile = `${sender}/${profile}`;

    dispatch(
      getAllInboxesForProfile(
        sender,
        sender_subidentity,
        receiver,
        target_shinkai_name_profile,
        setupDetailsState,
      ),
    );
  }, []);

  return (
    <IonPage className="bg-slate-900">
      <IonHeaderCustom>
        <IonTitle className="text-center text-inherit">
          {displayString}
        </IonTitle>
        <IonButtons slot="end">
          {" "}
          {/* Add the "+" button to the right side of the toolbar */}
          <IonButton onClick={() => setShowActionSheet(true)}>
            <IonIcon slot="icon-only" icon={addOutline} />
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
              {Object.entries(inboxes).map(([position, inboxId]) => (
                <IonItem
                  key={position}
                  button
                  className="ion-item-home"
                  onClick={() => {
                    const encodedInboxId = position.toString().replace(/\./g, "~");
                    if (encodedInboxId.startsWith("inbox")) {
                      history.push(`/chat/${encodeURIComponent(encodedInboxId)}`);
                    } else if (encodedInboxId.startsWith("job_inbox")) {
                      history.push(`/job-chat/${encodeURIComponent(encodedInboxId)}`);
                    }
                  }}
                >
                  <Avatar
                    url={`https://ui-avatars.com/api/?name=${position}&background=FE6162&color=fff`}
                    className="shrink-0"
                  />
                  <IonText className="ml-4 font-bold md:text-lg">
                    {JSON.stringify(position)}
                  </IonText>
                  <IonIcon
                    icon={arrowForward}
                    className="hidden md:ml-auto md:block"
                  />
                </IonItem>
              ))}
            </div>
          </div>
        </IonContentCustom>
      </IonContent>
      {/* Action Sheet (popup) */}
      <IonActionSheet
        className="ion-actionSheet-custom"
        isOpen={showActionSheet}
        onDidDismiss={() => setShowActionSheet(false)}
        buttons={[
          {
            text: "Admin Commands",
            role: permission_type !== "admin" ? "destructive" : undefined,
            handler: () => {
              if (permission_type === "admin") {
                history.push("/admin-commands");
              } else {
                console.log("Not authorized for Admin Commands");
              }
            },
          },
          {
            text: "Create Job",
            handler: () => {
              history.push("/create-job");
            },
          },
          {
            text: "Create Chat",
            handler: () => {
              history.push("/create-chat");
            },
          },
          {
            text: "Add Agent",
            handler: () => {
              history.push("/add-agent");
            },
          },
          {
            text: "Logout",
            role: "destructive",
            handler: () => {
              setShowLogoutAlert(true);
            },
          },
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              console.log("Cancel clicked");
            },
          },
        ]}
      ></IonActionSheet>
      <IonAlert
        isOpen={showLogoutAlert}
        onDidDismiss={() => setShowLogoutAlert(false)}
        header={"Confirm"}
        message={
          "Are you sure you want to logout? This will clear all your data."
        }
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              console.log("Cancel clicked");
            },
          },
          {
            text: "Yes",
            handler: () => {
              dispatch(clearStore());
              history.push("/connect");
            },
          },
        ]}
      />
    </IonPage>
  );
};

export default Home;
