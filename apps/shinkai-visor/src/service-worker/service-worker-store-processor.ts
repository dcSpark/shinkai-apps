import { store, thunks } from "./store";

type DispatchAction = keyof typeof thunks;
type DispatchActionArguments = Parameters<typeof thunks[DispatchAction]>;

export type StoreProcessorPayload = { type: 'dispatch', action: DispatchAction, payload: DispatchActionArguments };

export class ServiceWorkerStoreProcessor {
  process(data: StoreProcessorPayload): void {
    switch (data.type) {
      case 'dispatch':
        store.dispatch(thunks[data.action](...data.payload));
        break;
      default:
        console.log(`unknown store action type ${data.type}`);
        break;
    }
  }
}

export const serviceWorkerStoreProcessor = new ServiceWorkerStoreProcessor();
