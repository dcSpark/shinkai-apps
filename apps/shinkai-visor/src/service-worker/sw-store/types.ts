import { ThunkDispatch } from "@reduxjs/toolkit";

export type DispatchAction = ThunkDispatch<any, any, any>;
export type DispatchActionKey = string;
export type DispatchActionArguments = [arg: any];

export type StoreProcessorPayload = { type: 'dispatch', action: DispatchActionKey, payload: DispatchActionArguments };
export type ServiceWorkerMessageType = { type: 'store'; payload: StoreProcessorPayload };
