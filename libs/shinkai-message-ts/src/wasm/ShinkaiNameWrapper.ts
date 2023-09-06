import { ShinkaiNameWrapper as ShinkaiNameWrapperWASM } from "../pkg/shinkai_message_wasm.js";

export class ShinkaiNameWrapper {
    private wasmWrapper: ShinkaiNameWrapperWASM;

    constructor(shinkai_name_js: any) {
        this.wasmWrapper = new ShinkaiNameWrapperWASM(shinkai_name_js);
    }

    to_jsvalue(): any {
        return this.wasmWrapper.to_jsvalue();
    }

    to_json_str(): string {
        return this.wasmWrapper.to_json_str();
    }

    get get_full_name(): string {
        return this.wasmWrapper.get_full_name;
    }

    get get_node_name(): string {
        return this.wasmWrapper.get_node_name;
    }

    get get_profile_name(): string {
        return this.wasmWrapper.get_profile_name;
    }

    get get_subidentity_name(): string {
        return this.wasmWrapper.get_subidentity_name;
    }

    get get_subidentity_type(): string {
        return this.wasmWrapper.get_subidentity_type;
    }

    extract_profile(): ShinkaiNameWrapper {
        return new ShinkaiNameWrapper(this.wasmWrapper.extract_profile().get_full_name);
    }

    extract_node(): ShinkaiNameWrapper {
        return new ShinkaiNameWrapper(this.wasmWrapper.extract_node().get_full_name);
    }
}