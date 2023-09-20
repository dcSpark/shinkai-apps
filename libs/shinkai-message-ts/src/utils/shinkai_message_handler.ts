import { ShinkaiMessage } from '../models/ShinkaiMessage';
import { ShinkaiMessageWrapper } from '../wasm/ShinkaiMessageWrapper';

export function calculateMessageHash(message: ShinkaiMessage): string {
  const messageWrapper = new ShinkaiMessageWrapper(message);
  return messageWrapper.calculate_hash();
}

export const getMessageContent = (message: ShinkaiMessage) => {
  return message.body && 'unencrypted' in message.body
    ? 'unencrypted' in message.body.unencrypted.message_data
      ? message.body.unencrypted.message_data.unencrypted.message_raw_content
      : message.body.unencrypted.message_data.encrypted.content
    : message.body?.encrypted.content;
};

export const isLocalMessage = (
  message: ShinkaiMessage,
  profile: string,
  registrationName: string
) => {
  const localIdentity = `${profile}/device/${registrationName}`;
  return (
    message.body &&
    'unencrypted' in message.body &&
    message.body.unencrypted.internal_metadata.sender_subidentity ===
      localIdentity
  );
};
