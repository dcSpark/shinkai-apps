import { actions,store } from "./store";
import { configureStoreSw } from "./sw-store";

configureStoreSw(store, actions);
