import { Scry, Thread, Poke, SubscriptionRequestInterface } from "@urbit/http-api/src/types"

export { Scry, Thread, Poke, SubscriptionRequestInterface };
// TODO: Change to ShinkaiVisor
export const VISOR_ID = "oadimaacghcacmfipakhadejgalcaepg";

export type Permission = "shipName" | "shipURL" | "scry" | "thread" | "poke" | "subscribe" | "auth";
export type ShinkaiVisorAction = "on" | "check_connection" | "check_perms" | "run_auth" | "shipURL" | "perms" | "shipName" | "scry" | "poke" | "subscribe" | "subscribeOnce" | "unsubscribe" | "thread";
type ShinkaiVisorRequestType = Scry | Thread<any> | Poke<any> | SubscriptionRequestInterface | ShinkaiVisorAction[];

export interface ShinkaiVisorRequest {
    app: "shinkaiVisor",
    action: ShinkaiVisorAction,
    data?: ShinkaiVisorRequestType
}
export interface ShinkaiVisorResponse {
    id: string,
    status: "locked" | "noperms" | "ok"
    response?: any
    error?: any
}

export interface ShinkaiVisorEvent {
    action: ShinkaiVisorEventType
    requestID?: string,
    data?: any
}
export type ShinkaiVisorEventType = ShinkaiVisorInternalEvent | ShinkaiEvent

type ShinkaiVisorInternalEvent = "connected" | "disconnected" | "permissions_granted" | "permissions_revoked"
type ShinkaiEvent = "sse" | "poke_success" | "poke_error" | "subscription_error"

export interface PermissionGraph{
    [key: string]: {
        permissions: Permission[]
    }
}

type ShinkaiAction = "scry" | "thread" | "poke" | "subscribe"

// export interface Permission{
//   date: number,
//   capability: ShinkaiAction[]
//   caveats: Caveat[]
// }

// interface Caveat{
//     name: string,
//     type: string,
//     value: any
    
// }