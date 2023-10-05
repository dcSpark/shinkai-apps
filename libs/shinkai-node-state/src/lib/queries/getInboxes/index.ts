import { getAllInboxesForProfile } from "@shinkai_network/shinkai-message-ts/api";

import type { GetInboxesInput } from "./types";

export const getInboxes = async ({
  receiver,
  senderSubidentity,
  sender,
  targetShinkaiNameProfile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: GetInboxesInput) => {
  const inboxes = await getAllInboxesForProfile(
    sender,
    senderSubidentity,
    receiver,
    targetShinkaiNameProfile,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    }
  );
  return inboxes.map((inbox) => encodeURIComponent(inbox));
};
