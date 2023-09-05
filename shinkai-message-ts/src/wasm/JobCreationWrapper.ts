import { JobCreationWrapper as JobCreationWrapperWASM } from "../pkg/shinkai_message_wasm.js";

export class JobCreationWrapper {
    private wasmWrapper: JobCreationWrapperWASM;

    constructor(scope_js: any) {
        this.wasmWrapper = new JobCreationWrapperWASM(scope_js);
    }

    to_jsvalue(): any {
        return this.wasmWrapper.to_jsvalue();
    }

    to_json_str(): string {
        return this.wasmWrapper.to_json_str();
    }

    static from_json_str(s: string): JobCreationWrapper {
        let js_value = JSON.parse(s);
        return new JobCreationWrapper(js_value.scope);
    }

    static from_jsvalue(js_value: any): JobCreationWrapper {
        return new JobCreationWrapper(js_value.scope);
    }

    static empty(): JobCreationWrapper {
        return new JobCreationWrapper(JobCreationWrapperWASM.empty().get_scope);
    }

    free(): void {
        this.wasmWrapper.free();
    }

    get get_scope(): any {
        return this.wasmWrapper.get_scope;
    }
}