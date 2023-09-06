import { InboxNameWrapper as InboxNameWrapperWASM } from "../../pkg/shinkai_message_wasm.js";

export class InboxNameWrapper {
    private wasmWrapper: InboxNameWrapperWASM;

    constructor(inbox_name_js: any) {
        this.wasmWrapper = new InboxNameWrapperWASM(inbox_name_js);
    }

    free(): void {
        this.wasmWrapper.free();
    }

    to_jsvalue(): any {
        return this.wasmWrapper.to_jsvalue();
    }

    to_json_str(): string {
        return this.wasmWrapper.to_json_str();
    }

    static get_regular_inbox_name_from_params(sender: string, sender_subidentity: string, recipient: string, recipient_subidentity: string, is_e2e: boolean): InboxNameWrapper {
        const wasmWrapper = InboxNameWrapperWASM.get_regular_inbox_name_from_params(sender, sender_subidentity, recipient, recipient_subidentity, is_e2e);
        return new InboxNameWrapper(wasmWrapper.get_value);
    }
    
    static get_job_inbox_name_from_params(unique_id: string): InboxNameWrapper {
        const wasmWrapper = InboxNameWrapperWASM.get_job_inbox_name_from_params(unique_id);
        return new InboxNameWrapper(wasmWrapper.get_value);
    }

    get get_identities(): any {
        return this.wasmWrapper.get_identities;
    }

    get get_is_e2e(): boolean {
        return this.wasmWrapper.get_is_e2e;
    }

    get get_unique_id(): any {
        return this.wasmWrapper.get_unique_id;
    }

    get get_value(): any {
        return this.wasmWrapper.get_value;
    }

    get to_string(): any {
        return this.wasmWrapper.to_string;
    }
}