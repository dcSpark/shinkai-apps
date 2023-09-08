import { combineReducers } from "redux";
import { setupDetailsReducer } from "./reducers/setupDetailsReducer";
import { messagesReducer } from "./reducers/messagesReducer";
import otherReducer from "./reducers/otherReducer";

const rootReducer = combineReducers({
  setupDetails: setupDetailsReducer,
  messages: messagesReducer,
  other: otherReducer,
});

export default rootReducer;
