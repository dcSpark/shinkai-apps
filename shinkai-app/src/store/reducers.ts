import { Base58String } from "../models/QRSetupData";
import { SerializedAgent } from "../models/SchemaTypes";
import { ShinkaiMessage } from "../models/ShinkaiMessage";
import { calculateMessageHash } from "../utils/shinkai_message_handler";
import {
  Action,
  GET_PUBLIC_KEY,
  USE_REGISTRATION_CODE,
  PING_ALL,
  REGISTRATION_ERROR,
  CREATE_REGISTRATION_CODE,
  CLEAR_REGISTRATION_CODE,
  RECEIVE_LAST_MESSAGES_FROM_INBOX,
  CLEAR_STORE,
  ADD_MESSAGE_TO_INBOX,
  RECEIVE_ALL_INBOXES_FOR_PROFILE,
  RECEIVE_LOAD_MORE_MESSAGES_FROM_INBOX,
  ADD_AGENTS,
} from "./types";

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

export interface RootState {
  registrationCode: string;
  publicKey: string;
  registrationStatus: boolean;
  pingResult: string;
  setupDetailsState: SetupDetailsState;
  error: string | null;
  inboxes: {
    [inboxId: string]: any[];
  };
  messageHashes: {
    [inboxId: string]: Set<string>;
  };
  agents: {
    [agentId: string]: SerializedAgent;
  };
}

const initialState: RootState = {
  publicKey: "",
  registrationStatus: false,
  pingResult: "",
  setupDetailsState: setupInitialState,
  registrationCode: "",
  error: null,
  inboxes: {},
  messageHashes: {},
  agents: {},
};

const rootReducer = (state = initialState, action: Action): RootState => {
  switch (action.type) {
    case GET_PUBLIC_KEY:
      return { ...state, publicKey: action.payload };
    case USE_REGISTRATION_CODE:
      return {
        ...state,
        registrationStatus: true,
        setupDetailsState: action.payload,
      };
    case RECEIVE_LOAD_MORE_MESSAGES_FROM_INBOX: {
      const { inboxId, messages } = action.payload;
      const currentMessages = state.inboxes[inboxId] || [];
      const currentMessageHashes = state.messageHashes[inboxId] || new Set();

      const uniqueNewMessages = messages.filter((msg: ShinkaiMessage) => {
        const hash = calculateMessageHash(msg);
        if (currentMessageHashes.has(hash)) {
          return false;
        } else {
          currentMessageHashes.add(hash);
          return true;
        }
      });

      return {
        ...state,
        inboxes: {
          ...state.inboxes,
          [inboxId]: [...currentMessages, ...uniqueNewMessages],
        },
        messageHashes: {
          ...state.messageHashes,
          [inboxId]: currentMessageHashes,
        },
      };
    }
    case RECEIVE_LAST_MESSAGES_FROM_INBOX: {
      const { inboxId, messages } = action.payload;
      const currentMessages = state.inboxes[inboxId] || [];
      const currentMessageHashes = state.messageHashes[inboxId] || new Set();

      const uniqueNewMessages = messages.filter((msg: ShinkaiMessage) => {
        const hash = calculateMessageHash(msg);
        if (currentMessageHashes.has(hash)) {
          return false;
        } else {
          currentMessageHashes.add(hash);
          return true;
        }
      });

      return {
        ...state,
        inboxes: {
          ...state.inboxes,
          [inboxId]: [...currentMessages, ...uniqueNewMessages],
        },
        messageHashes: {
          ...state.messageHashes,
          [inboxId]: currentMessageHashes,
        },
      };
    }
    case ADD_MESSAGE_TO_INBOX: {
      const { inboxId, message } = action.payload;
      const currentMessages = state.inboxes[inboxId] || [];
      const currentMessageHashes = state.messageHashes[inboxId] || new Set();

      const hash = calculateMessageHash(message);
      if (currentMessageHashes.has(hash)) {
        // If the message is a duplicate, don't add it
        return state;
      } else {
        // If the message is unique, add it to the inbox and the hash to the set
        currentMessageHashes.add(hash);
        return {
          ...state,
          inboxes: {
            ...state.inboxes,
            [inboxId]: [message, ...currentMessages],
          },
          messageHashes: {
            ...state.messageHashes,
            [inboxId]: currentMessageHashes,
          },
        };
      }
    }
    case RECEIVE_ALL_INBOXES_FOR_PROFILE: {
      const newInboxes = action.payload;
      if (typeof newInboxes !== "object") {
        console.error(
          "Invalid payload for RECEIVE_ALL_INBOXES_FOR_PROFILE: ",
          newInboxes
        );
        return state;
      }
      return {
        ...state,
        inboxes: {
          ...state.inboxes,
          ...Object.keys(newInboxes).reduce(
            (result: { [key: string]: any[] }, key) => {
              if (!state.inboxes[key]) {
                console.log("value for key: ", newInboxes[key]);
                result[newInboxes[key]] = [];
              }
              return result;
            },
            {}
          ),
        },
      };
    }
    case ADD_AGENTS: {
      const newAgents = action.payload;
      const updatedAgents = { ...state.agents };
      newAgents.forEach((agent: SerializedAgent) => {
        updatedAgents[agent.id] = agent;
      });
      return {
        ...state,
        agents: updatedAgents,
      };
    }
    case CREATE_REGISTRATION_CODE:
      return { ...state, registrationCode: action.payload };
    case REGISTRATION_ERROR:
      return { ...state, error: action.payload };
    case CLEAR_REGISTRATION_CODE:
      return { ...state, registrationCode: "" };
    case PING_ALL:
      return { ...state, pingResult: action.payload };
    case CLEAR_STORE:
      state = initialState;
      return state;
    default:
      return state;
  }
};

export default rootReducer;
