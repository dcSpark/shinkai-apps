/* eslint-disable @typescript-eslint/no-explicit-any */

import { ExternalMetadata, ShinkaiMessage } from '../models/ShinkaiMessage';
import { ShinkaiMessageWrapper as ShinkaiMessageWrapperWASM } from '../pkg/shinkai_message_wasm';

export class ShinkaiMessageWrapper {
  private wasmWrapper: ShinkaiMessageWrapperWASM;

  constructor(message: ShinkaiMessage) {
    this.wasmWrapper = ShinkaiMessageWrapperWASM.fromJsValue(message);
  }

  static fromJsValue(j: any): ShinkaiMessageWrapper {
    const message: ShinkaiMessage = j;
    return new ShinkaiMessageWrapper(message);
  }

  to_jsvalue(): any {
    return this.wasmWrapper.to_jsvalue();
  }

  to_json_str(): string {
    return this.wasmWrapper.to_json_str();
  }

  calculate_hash(): string {
    return this.wasmWrapper.calculate_blake3_hash();
  }

  static time_now(): string {
    return ShinkaiMessageWrapperWASM.generate_time_now();
  }

  static from_json_str(s: string): ShinkaiMessageWrapper {
    const message: ShinkaiMessage = JSON.parse(s);
    return new ShinkaiMessageWrapper(message);
  }

  get body(): Body {
    return this.wasmWrapper.message_body;
  }

  get encryption(): string {
    return this.wasmWrapper.encryption;
  }

  get external_metadata(): ExternalMetadata {
    return this.wasmWrapper.external_metadata;
  }
}
