import { ShinkaiMessage } from "../models/ShinkaiMessage";
import { ShinkaiMessageWrapper } from "../wasm/ShinkaiMessageWrapper";

export function calculateMessageHash(message: ShinkaiMessage): string {
  const messageWrapper = new ShinkaiMessageWrapper(message);
  return messageWrapper.calculate_hash();
}
