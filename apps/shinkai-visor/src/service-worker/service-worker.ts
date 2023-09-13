import { store, thunks } from "./store";
import { configureStoreSw } from "./sw-store";

configureStoreSw(store, thunks);
