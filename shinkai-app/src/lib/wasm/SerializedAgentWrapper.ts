import { SerializedAgent } from "../../models/SchemaTypes.js";
import { SerializedAgentWrapper as SerializedAgentWrapperWASM } from "../../pkg/shinkai_message_wasm.js";

export class SerializedAgentWrapper {
  private wasmWrapper: SerializedAgentWrapperWASM;

  constructor(serialized_agent_js: any) {
    this.wasmWrapper = new SerializedAgentWrapperWASM(serialized_agent_js);
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

  static fromSerializedAgent(agent: SerializedAgent): SerializedAgentWrapper {
    let modelStr = "";
    if (agent.model && agent.model.OpenAI && agent.model.OpenAI.model_type) {
      modelStr = "openai:" + agent.model.OpenAI.model_type;
    } else if (agent.model && agent.model.SleepAPI) {
      modelStr = "sleep";
    } else {
      throw new Error("Invalid model: " + JSON.stringify(agent.model));
    }
    const toolkitPermissionsStr =
      agent.toolkit_permissions.length > 0
        ? agent.toolkit_permissions.join(",")
        : "";
    const storageBucketPermissionsStr =
      agent.storage_bucket_permissions.length > 0
        ? agent.storage_bucket_permissions.join(",")
        : "";
    const allowedMessageSendersStr =
      agent.allowed_message_senders.length > 0
        ? agent.allowed_message_senders.join(",")
        : "";

    const wasmWrapper = SerializedAgentWrapperWASM.fromStrings(
      agent.id,
      agent.full_identity_name,
      agent.perform_locally.toString(),
      agent.external_url || "",
      agent.api_key || "",
      modelStr,
      toolkitPermissionsStr,
      storageBucketPermissionsStr,
      allowedMessageSendersStr
    );
    return new SerializedAgentWrapper(wasmWrapper.to_jsvalue());
  }

  static fromStrings(
    id: string,
    full_identity_name: string,
    perform_locally: string,
    external_url: string,
    api_key: string,
    model: string,
    toolkit_permissions: string,
    storage_bucket_permissions: string,
    allowed_message_senders: string
  ): SerializedAgentWrapper {
    const wasmWrapper = SerializedAgentWrapperWASM.fromStrings(
      id,
      full_identity_name,
      perform_locally,
      external_url,
      api_key,
      model,
      toolkit_permissions,
      storage_bucket_permissions,
      allowed_message_senders
    );
    return new SerializedAgentWrapper(wasmWrapper.to_jsvalue());
  }

  static fromJsValue(j: any): SerializedAgentWrapper {
    const wasmWrapper = SerializedAgentWrapperWASM.fromJsValue(j);
    return new SerializedAgentWrapper(wasmWrapper.to_jsvalue());
  }

  static from_json_str(s: string): SerializedAgentWrapper {
    const wasmWrapper = SerializedAgentWrapperWASM.from_json_str(s);
    return new SerializedAgentWrapper(wasmWrapper.to_jsvalue());
  }

  get inner(): any {
    return this.wasmWrapper.inner;
  }
}
