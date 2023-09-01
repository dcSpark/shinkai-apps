import { Scry, Thread, Poke, SubscriptionRequestInterface } from "@urbit/http-api/src/types"

export { Scry, Thread, Poke, SubscriptionRequestInterface };
export const VISOR_ID = "oadimaacghcacmfipakhadejgalcaepg";

export type Permission = "shipName" | "shipURL" | "scry" | "thread" | "poke" | "subscribe" | "auth";
export type AgrihanVisorAction = "on" | "check_connection" | "check_perms" | "run_auth" | "shipURL" | "perms" | "shipName" | "scry" | "poke" | "subscribe" | "subscribeOnce" | "unsubscribe" | "thread";
type AgrihanVisorRequestType = Scry | Thread<any> | Poke<any> | SubscriptionRequestInterface | AgrihanVisorAction[];

export interface AgrihanVisorRequest {
    app: "agrihanVisor",
    action: AgrihanVisorAction,
    data?: AgrihanVisorRequestType
}
export interface AgrihanVisorResponse {
    id: string,
    status: "locked" | "noperms" | "ok"
    response?: any
    error?: any
}

export interface AgrihanVisorEvent {
    action: AgrihanVisorEventType
    requestID?: string,
    data?: any
}
export type AgrihanVisorEventType = AgrihanVisorInternalEvent | AgrihanEvent

type AgrihanVisorInternalEvent = "connected" | "disconnected" | "permissions_granted" | "permissions_revoked"
type AgrihanEvent = "sse" | "poke_success" | "poke_error" | "subscription_error"

export interface PermissionGraph{
    [key: string]: {
        permissions: Permission[]
    }
}

type AgrihanAction = "scry" | "thread" | "poke" | "subscribe"

// export interface Permission{
//   date: number,
//   capability: AgrihanAction[]
//   caveats: Caveat[]
// }

// interface Caveat{
//     name: string,
//     type: string,
//     value: any
    
// }