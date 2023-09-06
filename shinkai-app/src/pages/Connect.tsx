import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonLabel,
  IonItem,
  IonToast,
  InputChangeEventDetail,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import { submitRegistrationCode } from "../api";
import { BrowserQRCodeReader } from "@zxing/browser";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../store";
import { QrScanner, QrScannerProps } from "@yudiel/react-qr-scanner";
import { BarcodeScanner } from "@capacitor-community/barcode-scanner";
import { isPlatform } from "@ionic/react";
import {
  generateEncryptionKeys,
  generateSignatureKeys,
} from "../utils/wasm_helpers";
import { QRSetupData } from "../models/QRSetupData";
import { SetupDetailsState } from "../store/reducers";
import { InputCustomEvent } from "@ionic/core/dist/types/components/input/input-interface";
import { cn } from "../theme/lib/utils";
import Button from "../components/ui/Button";
import { IonHeaderCustom } from "../components/ui/Layout";
import Input from "../components/ui/Input";
import { scan, cloudUpload, checkmarkSharp } from "ionicons/icons";

export type MergedSetupType = SetupDetailsState & QRSetupData;

const Connect: React.FC = () => {
  const [setupData, setSetupData] = useState<MergedSetupType>({
    registration_code: "",
    profile: "main",
    registration_name: "main_device",
    identity_type: "device",
    permission_type: "admin",
    node_address: "",
    shinkai_identity: "",
    node_encryption_pk: "",
    node_signature_pk: "",
    profile_encryption_sk: "",
    profile_encryption_pk: "",
    profile_identity_sk: "",
    profile_identity_pk: "",
    my_device_encryption_sk: "",
    my_device_encryption_pk: "",
    my_device_identity_sk: "",
    my_device_identity_pk: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();
  const errorFromState = useSelector((state: RootState) => state.error);

  // Generate keys when the component mounts
  useEffect(() => {
    // Assuming the seed is a random 32 bytes array.
    // Device Keys
    let seed = crypto.getRandomValues(new Uint8Array(32));
    generateEncryptionKeys(seed).then(
      ({ my_encryption_sk_string, my_encryption_pk_string }) =>
        setSetupData((prevState) => ({
          ...prevState,
          my_device_encryption_pk: my_encryption_pk_string,
          my_device_encryption_sk: my_encryption_sk_string,
        }))
    );
    generateSignatureKeys().then(
      ({ my_identity_pk_string, my_identity_sk_string }) =>
        setSetupData((prevState) => ({
          ...prevState,
          my_device_identity_pk: my_identity_pk_string,
          my_device_identity_sk: my_identity_sk_string,
        }))
    );

    // Profile Keys
    seed = crypto.getRandomValues(new Uint8Array(32));
    generateEncryptionKeys(seed).then(
      ({ my_encryption_sk_string, my_encryption_pk_string }) =>
        setSetupData((prevState) => ({
          ...prevState,
          profile_encryption_pk: my_encryption_pk_string,
          profile_encryption_sk: my_encryption_sk_string,
        }))
    );
    generateSignatureKeys().then(
      ({ my_identity_pk_string, my_identity_sk_string }) =>
        setSetupData((prevState) => ({
          ...prevState,
          profile_identity_pk: my_identity_pk_string,
          profile_identity_sk: my_identity_sk_string,
        }))
    );
  }, []);

  const updateSetupData = (data: Partial<MergedSetupType>) => {
    setSetupData((prevState) => ({ ...prevState, ...data }));
  };

  const handleScan = async (data: any) => {
    if (data) {
      const result = JSON.parse(data);
      console.log("Prev. QR Code Data:", setupData);
      updateSetupData(result);
      console.log("New QR Code Data:", setupData);
    }
  };
  console.log(isPlatform("desktop"));
  const handleImageUpload = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: isPlatform("desktop")
          ? CameraSource.Photos
          : CameraSource.Prompt,
      });
      const codeReader = new BrowserQRCodeReader();
      const resultImage = await codeReader.decodeFromImageUrl(image.dataUrl);
      const json_string = resultImage.getText();
      const parsedData: QRSetupData = JSON.parse(json_string);
      updateSetupData(parsedData);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleError = (err: Error) => {
    console.error(err);
  };

  const handleQRScan = async () => {
    if (isPlatform("capacitor")) {
      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        handleScan(result.content);
      }
    }
  };

  const finishSetup = async () => {
    setStatus("loading");
    const success = await dispatch(submitRegistrationCode(setupData));

    if (success) {
      setStatus("success");
      localStorage.setItem("setupComplete", "true");
      history.push("/home");
    } else {
      setStatus("error");

      console.log("Error from state:", errorFromState);
      toast.error(errorFromState);
    }
  };

  return (
    <IonPage>
      {/*<IonHeaderCustom>*/}
      {/*  <IonTitle className="container text-accent text-center">*/}
      {/*    Connect*/}
      {/*  </IonTitle>*/}
      {/*</IonHeaderCustom>*/}

      <IonContent fullscreen>
        {error && <IonToast color="danger" message={error} duration={2000} />}
        <div className="relative flex min-h-screen min-h-screen-ios lg:p-6 md:px-6 md:pt-16 md:pb-10 bg-slate-900">
          <div className="relative hidden shrink-0 w-[40rem] p-20 overflow-hidden 2xl:w-[37.5rem] xl:w-[30rem] lg:p-10 lg:block">
            <div className="max-w-[25.4rem]">
              <div className="mb-4 text-7xl font-bold leading-none uppercase font-newake text-white">
                AI AGENT OS THAT UNLOCKS THE POTENTIAL OF LLMS
              </div>
              <div className="text-lg text-slate-900">
                For devices, identities, and digital money
              </div>
            </div>
            <div className="h-[16rem] mt-20 flex justify-center">
              <img
                src="/messaging.png"
                className="inline-block align-top opacity-0 transition-opacity opacity-100 object-contain h-full"
                alt=""
              />
            </div>
          </div>
          <div className="flex grow p-10 md:rounded-[1.25rem] bg-white dark:bg-slate-800">
            <div className="w-full max-w-[31.5rem] m-auto">
              <a href="https://shinkai.com/" target="_blank">
                <img
                  className="block dark:hidden mx-auto mb-10"
                  src="/shinkai-logo.svg"
                  alt=""
                />
                <img
                  className="hidden dark:block mx-auto mb-10"
                  src="/shinkai-logo-white.svg"
                  alt=""
                />
              </a>
              <div className="space-y-2">
                <Button variant={"secondary"} onClick={handleImageUpload}>
                  <IonIcon
                    slot="icon-only"
                    icon={cloudUpload}
                    className="mr-4"
                  />
                  Upload QR Code
                </Button>
                {isPlatform("capacitor") ? (
                  <Button onClick={handleQRScan}>Scan QR Code</Button>
                ) : (
                  <CustomQrScanner
                    scanDelay={300}
                    onError={handleError}
                    onDecode={handleScan}
                    containerStyle={{ width: "100%" }}
                  />
                )}
              </div>
              <hr className="w-full border-b border-gray-300 dark:border-slate-600/60 mt-6 mb-6" />
              <div className="space-y-5">
                <Input
                  value={setupData.registration_code}
                  onChange={(e) =>
                    updateSetupData({ registration_code: e.detail.value! })
                  }
                  label="Registration Code"
                />
                <Input
                  value={setupData.registration_name}
                  onChange={(e) =>
                    updateSetupData({ registration_name: e.detail.value! })
                  }
                  label="Registration Name (Your choice)"
                />
                <Input
                  value={setupData.node_address}
                  onChange={(e) =>
                    updateSetupData({ node_address: e.detail.value! })
                  }
                  label="Node Address (IP:PORT)"
                />
                <Input
                  value={setupData.shinkai_identity}
                  onChange={(e) =>
                    updateSetupData({ shinkai_identity: e.detail.value! })
                  }
                  label="Shinkai Identity (@@IDENTITY.shinkai)"
                />
                <Input
                  value={setupData.node_encryption_pk}
                  onChange={(e) =>
                    updateSetupData({ node_encryption_pk: e.detail.value! })
                  }
                  label="Node Encryption Public Key"
                />
                <Input
                  value={setupData.node_signature_pk}
                  onChange={(e) =>
                    updateSetupData({ node_signature_pk: e.detail.value! })
                  }
                  label="Node Signature Public Key"
                />
                <Input
                  value={setupData.profile_encryption_pk}
                  onChange={(e) =>
                    updateSetupData({
                      profile_encryption_pk: e.detail.value!,
                    })
                  }
                  label="Profile Encryption Public Key"
                />
                <Input
                  value={setupData.profile_identity_pk}
                  onChange={(e) =>
                    updateSetupData({ profile_identity_pk: e.detail.value! })
                  }
                  label="Profile Signature Public Key"
                />
                <Input
                  value={setupData.my_device_encryption_pk}
                  onChange={(e) =>
                    updateSetupData({
                      my_device_encryption_pk: e.detail.value!,
                    })
                  }
                  label="My Encryption Public Key"
                />
                <Input
                  value={setupData.my_device_identity_pk}
                  onChange={(e) =>
                    updateSetupData({ my_device_identity_pk: e.detail.value! })
                  }
                  label="My Signature Public Key"
                />
                {status === "error" && (
                  <p
                    role={"alert"}
                    className={"text-red-600 text-base text-center"}
                  >
                    Something went wrong. Please check your inputs and try again
                  </p>
                )}
                <Button
                  onClick={finishSetup}
                  className="mt-6"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <IonSpinner
                      name="bubbles"
                      className={"w-10 h-10"}
                    ></IonSpinner>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Connect;

function CustomQrScanner({
  onError,
  onDecode,
  scanDelay,
  containerStyle,
}: {
  onError: QrScannerProps["onError"];
  onDecode: QrScannerProps["onDecode"];
  containerStyle: React.CSSProperties;
  scanDelay: number;
}) {
  const [showScanner, setShowScanner] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  return showScanner ? (
    <div className="relative">
      <QrScanner
        scanDelay={scanDelay}
        onError={onError}
        onDecode={onDecode}
        containerStyle={containerStyle}
        onResult={(result) => {
          setStatus("success");
          setShowScanner(false);
        }}
      />
      <Button
        variant={"tertiary"}
        onClick={() => setShowScanner(false)}
        className="absolute bottom-2 z-10 max-w-[80px] left-1/2 transform -translate-x-1/2"
      >
        Close
      </Button>
      <IonToast
        message={"QR Code scanned successfully!"}
        duration={5000}
        icon={checkmarkSharp}
        isOpen={status === "success"}
      ></IonToast>
    </div>
  ) : (
    <Button
      variant={"secondary"}
      onClick={() => setShowScanner(true)}
      className="mt-6"
    >
      <IonIcon slot="icon-only" icon={scan} className="mr-4" />
      Scan QR Code
    </Button>
  );
}
