import { SerializedAgent } from "@shinkai/shinkai-message-ts/models";

import {
  Action,
  ADD_AGENTS,
  CLEAR_REGISTRATION_CODE,
  CLEAR_STORE,
  CREATE_REGISTRATION_CODE,
  GET_PUBLIC_KEY,
  PING_ALL,
  RECEIVE_ALL_INBOXES_FOR_PROFILE,
  REGISTRATION_ERROR,
  USE_REGISTRATION_CODE,
} from "../types";

export interface OtherState {
  registrationCode: string;
  publicKey: string;
  registrationStatus: boolean;
  pingResult: string;
  error: string | null;
  agents: {
    [agentId: string]: SerializedAgent;
  };
  just_inboxes: string[];
}

const initialState: OtherState = {
  publicKey: "",
  registrationStatus: false,
  pingResult: "",
  registrationCode: "",
  error: null,
  agents: {},
  just_inboxes: [],
};

const otherReducer = (state = initialState, action: Action): OtherState => {
  switch (action.type) {
    case USE_REGISTRATION_CODE:
      return {
        ...state,
        registrationStatus: true,
      };
    case RECEIVE_ALL_INBOXES_FOR_PROFILE: {
      const newInboxes = action.payload;
      if (!Array.isArray(newInboxes)) {
        console.error(
          "Invalid payload for RECEIVE_ALL_INBOXES_FOR_PROFILE: ",
          newInboxes
        );
        return state;
      }
      return {
        ...state,
        just_inboxes: newInboxes,
      };
    }
    case GET_PUBLIC_KEY:
      return { ...state, publicKey: action.payload };
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

export default otherReducer;
