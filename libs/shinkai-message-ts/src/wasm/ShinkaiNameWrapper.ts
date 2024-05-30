/* eslint-disable @typescript-eslint/no-explicit-any */

import { ShinkaiMessage } from '../models';
import { ShinkaiNameWrapper as ShinkaiNameWrapperWASM } from '../pkg/shinkai_message_wasm';

export class ShinkaiNameWrapper {
  private wasmWrapper: ShinkaiNameWrapperWASM;

  constructor(shinkai_name_js: any) {
    this.wasmWrapper = new ShinkaiNameWrapperWASM(shinkai_name_js);
  }

  static from_shinkai_message_sender(
    message: ShinkaiMessage,
  ): ShinkaiNameWrapper {
    if (!message.body || !('unencrypted' in message.body)) {
      throw new Error('shinkai message is encrypted');
    }
    let name = message.external_metadata?.sender;
    if (message.body.unencrypted.internal_metadata.sender_subidentity) {
      name += `/${message.body.unencrypted.internal_metadata.sender_subidentity}`;
    }
    return new ShinkaiNameWrapper(name);
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
    return this.wasmWrapper.get_node_name_string;
  }

  get get_profile_name(): string {
    return this.wasmWrapper.get_profile_name_string;
  }

  get get_subidentity_name(): string {
    return this.wasmWrapper.get_subidentity_name;
  }

  get get_subidentity_type(): string {
    return this.wasmWrapper.get_subidentity_type;
  }

  extract_profile(): ShinkaiNameWrapper {
    return new ShinkaiNameWrapper(
      this.wasmWrapper.extract_profile().get_full_name,
    );
  }

  extract_node(): ShinkaiNameWrapper {
    return new ShinkaiNameWrapper(
      this.wasmWrapper.extract_node().get_full_name,
    );
  }
}
