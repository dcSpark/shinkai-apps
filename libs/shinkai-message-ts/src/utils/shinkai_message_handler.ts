import { MessageSchemaType } from '../models/SchemaTypes';
import { ShinkaiMessage } from '../models/ShinkaiMessage';
import { ShinkaiNameWrapper } from '../wasm';
import { ShinkaiMessageWrapper } from '../wasm/ShinkaiMessageWrapper';

export function calculateMessageHash(message: ShinkaiMessage): string {
  const messageWrapper = new ShinkaiMessageWrapper(message);
  return messageWrapper.calculate_hash();
}

export const isJobMessage = (message: ShinkaiMessage) => {
  return (
    message.body &&
    'unencrypted' in message.body &&
    'unencrypted' in message.body.unencrypted.message_data &&
    message.body.unencrypted.message_data.unencrypted.message_content_schema ===
      MessageSchemaType.JobMessageSchema
  );
};

export const getMessageContent = (message: ShinkaiMessage): string => {
  if (!message) return '';
  // unnencrypted content
  if (message.body && 'unencrypted' in message.body) {
    if ('unencrypted' in message.body.unencrypted.message_data) {
      const isJobMessage =
        message.body.unencrypted.message_data.unencrypted
          .message_content_schema === MessageSchemaType.JobMessageSchema;
      // job message
      if (isJobMessage) {
        try {
          return JSON.parse(
            message.body.unencrypted.message_data.unencrypted
              .message_raw_content,
          )?.content;
        } catch (e) {
          // fallback to raw content even if it's a job mesage
          console.log('error parsing message raw content', e);
          return message.body.unencrypted.message_data.unencrypted
            .message_raw_content;
        }
      }
      // default message
      return message.body.unencrypted.message_data.unencrypted
        .message_raw_content;
    }
    // raw content for unnencrypted body
    return message.body.unencrypted.message_data.encrypted.content;
  }
  // raw content for encrypted body
  return message.body?.encrypted.content || '';
};

export const getMessageFilesInbox = (
  message: ShinkaiMessage,
): string | undefined => {
  // unnencrypted content
  if (message.body && 'unencrypted' in message.body) {
    if ('unencrypted' in message.body.unencrypted.message_data) {
      const isJobMessage =
        message.body.unencrypted.message_data.unencrypted
          .message_content_schema === MessageSchemaType.JobMessageSchema;
      // job message
      if (isJobMessage) {
        try {
          const parsedMessage = JSON.parse(
            message.body.unencrypted.message_data.unencrypted
              .message_raw_content,
          );
          return parsedMessage?.files_inbox;
        } catch (e) {
          console.log('error parsing message raw content', e);
        }
      }
    }
  }
  return undefined;
};

export const isLocalMessage = (
  message: ShinkaiMessage,
  myNodeIdentity: string,
  myProfile: string,
): boolean => {
  try {
    const messageNameWrapper =
      ShinkaiNameWrapper.from_shinkai_message_sender(message);

    return (
      (!messageNameWrapper.get_subidentity_type ||
        messageNameWrapper.get_subidentity_type === 'None' ||
        messageNameWrapper.get_subidentity_type === 'device') &&
      messageNameWrapper.get_node_name === myNodeIdentity &&
      messageNameWrapper.get_profile_name === myProfile
    );
  } catch (e) {
    console.log('IsLocalMessage Error:', e);
    return false;
  }
};

export const extractErrorPropertyOrContent = (
  content: string,
  property: 'error' | 'error_message',
) => {
  try {
    const parsedContent = JSON.parse(content);
    if (property in parsedContent) {
      return parsedContent[property];
    }
  } catch {
    /* ignore */
  }
  return String(content);
};
