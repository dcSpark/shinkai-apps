/* eslint-disable @typescript-eslint/no-explicit-any */

import { SerializedLLMProvider } from '../models/SchemaTypes';
import { SerializedLLMProviderWrapper as SerializedLLMProviderWrapperWASM } from '../pkg/shinkai_message_wasm';

export class SerializedLLMProviderWrapper {
  private wasmWrapper: SerializedLLMProviderWrapperWASM;

  constructor(serialized_agent_js: any) {
    this.wasmWrapper = new SerializedLLMProviderWrapperWASM(
      serialized_agent_js,
    );
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

  static fromSerializedAgent(
    agent: SerializedLLMProvider,
  ): SerializedLLMProviderWrapper {
    let modelStr = '';
    if (agent.model && agent.model.OpenAI && agent.model.OpenAI.model_type) {
      modelStr = 'openai:' + agent.model.OpenAI.model_type;
    } else if (
      agent.model &&
      agent.model.GenericAPI &&
      agent.model.GenericAPI.model_type
    ) {
      modelStr = 'genericapi:' + agent.model.GenericAPI.model_type;
    } else if (agent?.model?.Ollama) {
      modelStr = 'ollama:' + agent.model.Ollama.model_type;
    } else if (agent?.model?.Gemini) {
      modelStr = 'gemini:' + agent.model.Gemini.model_type;
    } else if (Object.keys(agent?.model).length > 0) {
      const customModelProvider = Object.keys(agent.model)[0];
      modelStr = `${customModelProvider}:${agent.model[customModelProvider].model_type}`;
    } else {
      throw new Error('Invalid model: ' + JSON.stringify(agent.model));
    }
    const toolkitPermissionsStr =
      agent.toolkit_permissions.length > 0
        ? agent.toolkit_permissions.join(',')
        : '';
    const storageBucketPermissionsStr =
      agent.storage_bucket_permissions.length > 0
        ? agent.storage_bucket_permissions.join(',')
        : '';
    const allowedMessageSendersStr =
      agent.allowed_message_senders.length > 0
        ? agent.allowed_message_senders.join(',')
        : '';

    const wasmWrapper = SerializedLLMProviderWrapperWASM.fromStrings(
      agent.id,
      agent.full_identity_name,
      agent.perform_locally.toString(),
      agent.external_url || '',
      agent.api_key || '',
      modelStr,
      toolkitPermissionsStr,
      storageBucketPermissionsStr,
      allowedMessageSendersStr,
    );
    return new SerializedLLMProviderWrapper(wasmWrapper.to_jsvalue());
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
    allowed_message_senders: string,
  ): SerializedLLMProviderWrapper {
    const wasmWrapper = SerializedLLMProviderWrapperWASM.fromStrings(
      id,
      full_identity_name,
      perform_locally,
      external_url,
      api_key,
      model,
      toolkit_permissions,
      storage_bucket_permissions,
      allowed_message_senders,
    );
    return new SerializedLLMProviderWrapper(wasmWrapper.to_jsvalue());
  }

  static fromJsValue(j: any): SerializedLLMProviderWrapper {
    const wasmWrapper = SerializedLLMProviderWrapperWASM.fromJsValue(j);
    return new SerializedLLMProviderWrapper(wasmWrapper.to_jsvalue());
  }

  static from_json_str(s: string): SerializedLLMProviderWrapper {
    const wasmWrapper = SerializedLLMProviderWrapperWASM.from_json_str(s);
    return new SerializedLLMProviderWrapper(wasmWrapper.to_jsvalue());
  }

  get inner(): any {
    return this.wasmWrapper.inner;
  }
}
