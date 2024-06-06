export class ShinkaiNameError extends Error {
  constructor(public type: 'InvalidFormat' | 'ReceiverNotFound') {
    super(`Shinkai Name Error: ${type}`);
    this.name = 'ShinkaiNameError';
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

export const getOtherPersonIdentity = (
  inboxName: string,
  myIdentity: string,
) => {
  const parts = inboxName.split('::');
  const otherPersonIdentity = parts.filter(
    (part) => part !== myIdentity && part !== 'inbox' && part !== 'false',
  );
  return otherPersonIdentity[0];
};

export const isShinkaiIdentityLocalhost = (
  shinkaiIdentity: string,
): boolean => {
  return shinkaiIdentity.includes('localhost.arb-sep-shinkai');
};

export const extractReceiverShinkaiName = (
  deserializedId: string,
  senderShinkaiName: string,
): string => {
  const parts: string[] = deserializedId.split('::');
  if (parts.length < 3 || parts.length > 101) {
    throw new ShinkaiNameError('InvalidFormat');
  }

  const nodeRegex = /^@@[a-zA-Z0-9_]+\.shinkai.*$/;
  let receiverShinkaiName = '';
  let hasSeenSender = false;

  for (let i = 1; i < parts.length - 1; i++) {
    const part = parts[i].split('/')[0]; // Extract base part of the shinkai name
    if (!nodeRegex.test(part)) {
      throw new ShinkaiNameError('InvalidFormat');
    }

    // Skip the sender's shinkai name
    if (part === senderShinkaiName && hasSeenSender === false) {
      hasSeenSender = true;
      continue;
    }

    // Assign the receiver's shinkai name and break the loop
    receiverShinkaiName = part;
    break;
  }

  if (receiverShinkaiName === '') {
    throw new ShinkaiNameError('ReceiverNotFound');
  }

  return receiverShinkaiName;
};

export const extractJobIdFromInbox = (deserializedId: string): string => {
  const parts: string[] = deserializedId.split('::');
  if (parts.length < 3 || !isJobInbox(deserializedId)) {
    throw new ShinkaiNameError('InvalidFormat');
  }

  const jobId = parts[1];
  return jobId;
};

export const isJobInbox = (inboxId: string): boolean => {
  const parts: string[] = inboxId.split('::');
  if (parts.length < 3) {
    throw new ShinkaiNameError('InvalidFormat');
  }
  return parts[0] === 'job_inbox';
};

export const buildInboxIdFromJobId = (jobId: string): string => {
  // TODO: job_inbox, false is hardcoded
  return `job_inbox::${jobId}::false`;
};
