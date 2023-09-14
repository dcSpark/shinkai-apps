import { ThunkDispatch } from "@reduxjs/toolkit";

export type DispatchAction = ThunkDispatch<any, any, any>;
export type DispatchActionKey = string;
export type DispatchActionArguments = [arg: any];

export type DispatchMessageType = { type: 'dispatch', action: DispatchActionKey, payload: DispatchActionArguments };
export type CurrentStoreValueMessageType = { type: 'current-store-value' };
export type StoreChanged<StoreType> = { type: 'store-changed', payload: StoreType };
export type StoreMessageType = { type: 'store'; payload: DispatchMessageType | CurrentStoreValueMessageType | StoreChanged<any> };
