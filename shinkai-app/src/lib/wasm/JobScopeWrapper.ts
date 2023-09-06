import { JobScopeWrapper as JobScopeWrapperWASM } from "../../pkg/shinkai_message_wasm.js";

export class JobScopeWrapper {
    private wasmWrapper: JobScopeWrapperWASM;

    constructor(buckets_js: any, documents_js: any) {
        this.wasmWrapper = new JobScopeWrapperWASM(buckets_js, documents_js);
    }

    to_jsvalue(): any {
        return this.wasmWrapper.to_jsvalue();
    }

    to_json_str(): string {
        return this.wasmWrapper.to_json_str();
    }

    static from_json_str(s: string): JobScopeWrapper {
        let js_value = JSON.parse(s);
        return new JobScopeWrapper(js_value.buckets_js, js_value.documents_js);
    }
    
    static from_jsvalue(js_value: any): JobScopeWrapper {
        return new JobScopeWrapper(js_value.buckets_js, js_value.documents_js);
    }
    
    static empty(): JobScopeWrapper {
        return new JobScopeWrapper({}, {});
    }

    free(): void {
        this.wasmWrapper.free();
    }
}