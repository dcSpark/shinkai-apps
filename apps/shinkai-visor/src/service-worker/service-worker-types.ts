import { StoreProcessorPayload } from "./service-worker-store-processor";

export type ServiceWorkerMessageType = { type: 'store'; payload: StoreProcessorPayload };
