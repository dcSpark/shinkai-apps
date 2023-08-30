import { AgrihanVisorRequest, AgrihanVisorEvent, AgrihanVisorResponse } from "./types";

const Messaging = {
    pushEvent: function (event: AgrihanVisorEvent, recipients: Set<any>) {
        for (let id of recipients) {
            if (typeof id == "number") chrome.tabs.sendMessage(id, { app: "agrihanVisorEvent", event: event })
            if (typeof id == "string") chrome.runtime.sendMessage(id, { app: "agrihanVisorEvent", event: event })
        }
    },
    callVisor: function ({ app, action, data }: AgrihanVisorRequest): Promise<AgrihanVisorResponse> {
        return new Promise((res, rej) => {
            const requestId = Math.random().toString(36).substr(2, 9);
            // first add listener for the eventual response
            window.addEventListener('message', function responseHandler(e) {
                const response = e.data;
                // ignore messages with the wrong request app name, wrong id, or null
                if (response.app !== "agrihanVisorResponse" || response.id !== requestId) return;
                // remove listener else they keep stacking up
                window.removeEventListener('message', responseHandler);
                // reject promise if there's an error
                if (response.error) rej(response.error);
                // resolve if fine
                else res(response);
            });
            window.postMessage({ action, data, app, id: requestId }, window.origin);
        });
    }
};

export { Messaging }
