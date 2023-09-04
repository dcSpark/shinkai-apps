import { fromEvent, Subscription } from "rxjs";
import { VISOR_ID, Scry, Poke, Thread, Permission, SubscriptionRequestInterface, ShinkaiVisorAction, ShinkaiVisorRequest, ShinkaiVisorResponse, ShinkaiVisorEventType } from "./types";
import { Messaging } from "./messaging";
import { inject, visorPromptModal, showPopup, promptUnlock, promptPerms } from "./modals"

const modal = visorPromptModal();
console.log(modal, "modal injected")
inject(modal);

export const shinkaiVisor = {
    registerName: (name: string) => callVisor("register_name", { consumerName: name }),
    isConnected: () => requestData("check_connection"),
    promptConnection: () => promptUnlock(),
    authorizedPermissions: () => requestData("check_perms"),
    getShip: () => requestData("shipName"),
    getURL: () => requestData("shipURL"),
    requestPermissions: (permissions: ShinkaiVisorAction[]) => requestData("perms", permissions),
    scry: (payload: Scry) => requestData("scry", payload),
    poke: (payload: Poke<any>) => requestData("poke", payload),
    thread: (payload: Thread<any>) => requestData("thread", payload),
    subscribe: (payload: SubscriptionRequestInterface, once?: boolean) => requestData("subscribe", { payload: payload, once: once }),
    unsubscribe: (payload: number) => requestData("unsubscribe", payload),
    on: (eventType: ShinkaiVisorEventType, keys: string[], callback: Function) => addListener(eventType, keys, callback),
    off: (subscription: Subscription) => subscription.unsubscribe(),
    require: (perms: Permission[], callback: Function) => initialize(perms, callback),
    authorizeShip: (backendShip: string) => requestData("run_auth", backendShip)
};

async function initialize(perms: Permission[], callback: Function): Promise<void> {
    const sub = shinkaiVisor.on("connected", [], () => initialize(perms, callback));
    const sub2 = shinkaiVisor.on("permissions_granted", [], () => initialize(perms, callback));
    const isConnected = await requestData("check_connection");
    if (isConnected.response) {
        shinkaiVisor.off(sub);
        const existing = await requestData("check_perms");
        const granted = perms.every(p => existing.response.includes(p));
        if (granted) shinkaiVisor.off(sub2), callback();
        else requestData("perms", perms);
    } else promptUnlock();
};


function addListener(eventType: ShinkaiVisorEventType, keys: string[], callback: Function) {
    const get_in = (object: any, array: string[]): any => {
        if (object && typeof object === "object" && array.length) return get_in(object[array[0]], array.slice(1))
        else return object
    }
    const messages = fromEvent<MessageEvent>(window, 'message');
    return messages.subscribe((message) => {
        const data = message?.data?.event?.data;
        if (message.data.app == "shinkaiVisorEvent" && message.data.event.action == eventType) {
            if (!data) callback()
            else {
                const result = get_in(data, keys);
                if (result) callback(result);
            }
        }
    });
}


function callVisor(action, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const request = { app: "shinkaiVisor", action: action, data: data };
        chrome.runtime.sendMessage(VISOR_ID, request, response => resolve(response));
    });
}

const cleared = "check_connection" || "check_perms"


async function requestData(action: ShinkaiVisorAction, data: any = null): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const response = await branchRequest(action, data);
        if (response.status === "locked" && action !== cleared) promptUnlock()
        if (response.status == "noperms" && action !== cleared) promptPerms()
        if (response.error) reject(response)
        else resolve(response)
    })
};

async function branchRequest(action: ShinkaiVisorAction, data: any, count = 0): Promise<any> {
    return new Promise(async (resolve, reject) => {
        if (chrome.runtime?.id) resolve(callVisor(action, data));
        else {
            if ((window as any).shinkaiVisor) resolve(Messaging.callVisor({ app: "shinkaiVisor", action: action, data: data }));
            else if (count < 10) setTimeout(() => resolve(branchRequest(action, data, count++)), 1000);
            else reject("error")
        }
    });
}
