import { combineReducers } from "redux";

import { messagesReducer } from "./reducers/messagesReducer";
import otherReducer from "./reducers/otherReducer";
import { setupDetailsReducer } from "./reducers/setupDetailsReducer";

const rootReducer = combineReducers({
  setupDetails: setupDetailsReducer,
  messages: messagesReducer,
  other: otherReducer,
});

export default rootReducer;
