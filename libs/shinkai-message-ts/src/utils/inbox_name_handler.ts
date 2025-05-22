export class ShinkaiNameError extends Error {
  constructor(public type: 'InvalidFormat' | 'ReceiverNotFound') {
    super(`Shinkai Name Error: ${type}`);
    this.name = 'ShinkaiNameError';
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

export const isShinkaiIdentityLocalhost = (
  shinkaiIdentity: string,
): boolean => {
  return (
    shinkaiIdentity.includes('localhost.arb-sep-shinkai') ||
    shinkaiIdentity.includes('localhost.sep-shinkai') ||
    shinkaiIdentity.includes('localhost.shinkai')
  );
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
