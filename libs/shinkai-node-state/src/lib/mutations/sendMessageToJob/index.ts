import { sendMessageToJob as sendMessageToJobApi } from "@shinkai_network/shinkai-message-ts/api";

import { SendMessageToJobInput } from "./types";

export const sendMessageToJob = async ({
  jobId,
  message,
  files_inbox,
  sender,
  shinkaiIdentity,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: SendMessageToJobInput) => {
  return await sendMessageToJobApi(
    jobId,
    message,
    files_inbox,
    sender,
    shinkaiIdentity,
    "",
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    }
  );
};
