import { SerializedAgent } from "../models/SchemaTypes";
import { SetupDetailsState } from "./reducers";
import {
  GET_PUBLIC_KEY,
  USE_REGISTRATION_CODE,
  PING_ALL,
  REGISTRATION_ERROR,
  CREATE_REGISTRATION_CODE,
  RECEIVE_LAST_MESSAGES_FROM_INBOX,
  CLEAR_REGISTRATION_CODE,
  CLEAR_STORE,
  ADD_MESSAGE_TO_INBOX,
  RECEIVE_ALL_INBOXES_FOR_PROFILE,
  RECEIVE_LOAD_MORE_MESSAGES_FROM_INBOX,
  GET_AVAILABLE_AGENTS,
  CLEAR_MESSAGES,
  ADD_AGENTS,
} from "./types";

export const getPublicKey = (publicKey: string) => ({
  type: GET_PUBLIC_KEY,
  payload: publicKey,
});

export const useRegistrationCode = (setupData: SetupDetailsState) => ({
  type: USE_REGISTRATION_CODE,
  payload: setupData,
});

export const createRegistrationCode = (result: string) => ({
  type: CREATE_REGISTRATION_CODE,
  payload: result,
});

export const receiveLastMessagesFromInbox = (
  inboxId: string,
  messages: any[]
) => ({
  type: RECEIVE_LAST_MESSAGES_FROM_INBOX,
  payload: { inboxId, messages },
});

export const receiveLoadMoreMessagesFromInbox = (
  inboxId: string,
  messages: any[]
) => ({
  type: RECEIVE_LOAD_MORE_MESSAGES_FROM_INBOX,

  payload: { inboxId, messages },
});

export const registrationError = (error: string) => ({
  type: REGISTRATION_ERROR,
  payload: error,
});

export const pingAll = (result: string) => ({
  type: PING_ALL,
  payload: result,
});

export const clearStore = () => {
  return {
    type: CLEAR_STORE,
  };
};

export const clearMessages = () => ({
  type: CLEAR_MESSAGES,
});

export const addMessageToInbox = (inboxId: string, message: any) => ({
  type: ADD_MESSAGE_TO_INBOX,
  payload: { inboxId, message },
});

export const clearRegistrationCode = () => ({
  type: CLEAR_REGISTRATION_CODE,
});

export const receiveAllInboxesForProfile = (inboxes: string[]) => ({
  type: RECEIVE_ALL_INBOXES_FOR_PROFILE,
  payload: inboxes,
});

export interface AddAgentsAction {
  type: typeof ADD_AGENTS;
  payload: SerializedAgent[];
}

export function addAgents(agents: SerializedAgent[]): AddAgentsAction {
  return {
    type: ADD_AGENTS,
    payload: agents,
  };
}