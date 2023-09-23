import { IonContent, IonHeader, IonModal, IonTitle } from "@ionic/react";
import React from "react";
import './Modal.css'

const Modal = ({
  header,
  content,
  isOpen,
}: {
  header: React.ReactNode;
  content: React.ReactNode;
  isOpen: boolean;
}) => {
  return (
    <IonModal className="ion-modal-custom" isOpen={isOpen} >
      <IonHeader className={"p-4 font-bold shadow"}>
        <IonTitle>{header}</IonTitle>
      </IonHeader>
      <IonContent>{content}</IonContent>
    </IonModal>
  );
};

export default Modal;
