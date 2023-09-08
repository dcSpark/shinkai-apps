import { USE_REGISTRATION_CODE } from "../types";
import { Base58String } from "../../models/QRSetupData";

export type SetupDetailsState = {
  profile: string;
  permission_type: string;
  registration_name: string;
  node_address: string;
  shinkai_identity: string;
  node_encryption_pk: Base58String;
  node_signature_pk: Base58String;
  profile_encryption_sk: Base58String;
  profile_encryption_pk: Base58String;
  profile_identity_sk: Base58String;
  profile_identity_pk: Base58String;
  my_device_encryption_sk: Base58String;
  my_device_encryption_pk: Base58String;
  my_device_identity_sk: Base58String;
  my_device_identity_pk: Base58String;
};

const setupInitialState: SetupDetailsState = {
  profile: "",
  permission_type: "",
  registration_name: "",
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
};

interface SetupDetailsAction {
  type: typeof USE_REGISTRATION_CODE;
  payload?: SetupDetailsState;
}

export const setupDetailsReducer = (
  state = setupInitialState,
  action: SetupDetailsAction
): SetupDetailsState => {
  switch (action.type) {
    case USE_REGISTRATION_CODE: {
      const newState = action.payload ? action.payload : state;
      console.log("New state: ", newState);
      return newState;
    }
    default:
      return state;
  }
};
