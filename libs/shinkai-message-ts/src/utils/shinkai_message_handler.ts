import {
  blake3FromObj,
  EncryptedMessageBody,
  EncryptedShinkaiBody,
  MessageSchemaType,
  ShinkaiMessage,
  ShinkaiName,
  UnencryptedMessageBody,
  UnencryptedMessageData,
} from '@shinkai_network/shinkai-typescript';

export function calculateMessageHash(message: ShinkaiMessage): string {
  return blake3FromObj(message.body);
}

export const isJobMessage = (message: ShinkaiMessage) => {
  return (
    message.body instanceof UnencryptedMessageBody &&
    message.body.unencrypted.message_data instanceof UnencryptedMessageData &&
    message.body.unencrypted.message_data.unencrypted.message_content_schema ===
      MessageSchemaType.JobMessageSchema
  );
};

export const getMessageContent = (message: ShinkaiMessage): string => {
  if (!message) return '';
  // unnencrypted content
  if (message.body instanceof UnencryptedMessageBody) {
    if (
      message.body.unencrypted.message_data instanceof UnencryptedMessageData
    ) {
      const isJobMessage =
        message.body.unencrypted.message_data.unencrypted.message_content_schema ===
        MessageSchemaType.JobMessageSchema;
      // job message
      if (isJobMessage) {
        try {
          return JSON.parse(
            message.body.unencrypted.message_data.unencrypted.message_raw_content,
          )?.content;
        } catch (e) {
          // fallback to raw content even if it's a job mesage
          console.log('error parsing message raw content', e);
          return message.body.unencrypted.message_data.unencrypted.message_raw_content;
        }
      }
      // default message
      return message.body.unencrypted.message_data.unencrypted.message_raw_content;
    }
    // raw content for unnencrypted body
    return (
      message.body.unencrypted.message_data as unknown as EncryptedShinkaiBody
    ).content;
  }
  // raw content for encrypted body
  return (message.body as EncryptedMessageBody).encrypted.content || '';
};

export const getMessageFilesInbox = (
  message: ShinkaiMessage,
): string | undefined => {
  // unnencrypted content
  if (message.body instanceof UnencryptedMessageBody) {
    if (
      message.body.unencrypted.message_data instanceof UnencryptedMessageData
    ) {
      const isJobMessage =
        message.body.unencrypted.message_data.unencrypted.message_content_schema ===
        MessageSchemaType.JobMessageSchema;
      // job message
      if (isJobMessage) {
        try {
          const parsedMessage = JSON.parse(
            message.body.unencrypted.message_data.unencrypted.message_raw_content,
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
  const messageNameWrapper =
    ShinkaiName.fromShinkaiMessageUsingSenderAndIntraSender(message);
  return (
    (!messageNameWrapper.subidentityType ||
      messageNameWrapper.subidentityType === 'None' ||
      messageNameWrapper.subidentityType === 'device') &&
    messageNameWrapper.nodeName === myNodeIdentity &&
    messageNameWrapper.profileName === myProfile
  );
};
