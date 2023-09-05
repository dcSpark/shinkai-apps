import { JobMessageWrapper as JobMessageWrapperWASM } from "../../pkg/shinkai_message_wasm.js";

export class JobMessageWrapper {
    private wasmWrapper: JobMessageWrapperWASM;

    constructor(job_id_js: any, content_js: any) {
        this.wasmWrapper = new JobMessageWrapperWASM(job_id_js, content_js);
    }

    to_jsvalue(): any {
        return this.wasmWrapper.to_jsvalue();
    }

    to_json_str(): string {
        return this.wasmWrapper.to_json_str();
    }

    static from_json_str(s: string): JobMessageWrapper {
        let js_value = JSON.parse(s);
        return new JobMessageWrapper(js_value.job_id_js, js_value.content_js);
    }

    static from_jsvalue(js_value: any): JobMessageWrapper {
        return new JobMessageWrapper(js_value.job_id_js, js_value.content_js);
    }

    static fromStrings(job_id: string, content: string): JobMessageWrapper {
        return new JobMessageWrapper(job_id, content);
    }

    free(): void {
        this.wasmWrapper.free();
    }
}
