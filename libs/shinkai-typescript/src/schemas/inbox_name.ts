import { ShinkaiMessage } from '../shinkai_message/shinkai_message';
import { UnencryptedMessageBody } from '../shinkai_message/shinkai_message_body';
import { ShinkaiName } from './shinkai_name';

export class InboxNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InboxNameError';
  }
}

export class InboxName {
  public value: string;
  public isE2E: boolean;

  constructor(value: string, isE2E: boolean) {
    this.value = value;
    this.isE2E = isE2E;
  }

  static fromString(inboxName: string): InboxName {
    const parsed = InboxName.parseInboxName(inboxName);
    return new InboxName(parsed.value, parsed.isE2E);
  }

  static parseInboxName(inboxName: string): InboxName {
    inboxName = inboxName.toLowerCase();
    const parts: string[] = inboxName.split('::');
    if (parts.length < 3 || parts.length > 101) {
      throw new InboxNameError(`Invalid inbox name format: ${inboxName}`);
    }

    const isE2EString = parts[parts.length - 1];
    if (isE2EString !== 'true' && isE2EString !== 'false') {
      throw new InboxNameError(`Invalid E2E value: ${isE2EString}`);
    }
    const isE2E = isE2EString === 'true';
    const inbox = new InboxName(inboxName, isE2E);

    if (parts[0] === 'inbox') {
      const identities: ShinkaiName[] = [];
      for (let i = 1; i < parts.length - 1; i++) {
        if (!ShinkaiName.isFullyValid(parts[i])) {
          throw new InboxNameError(`Invalid inbox name format: ${inboxName}`);
        }
        identities.push(new ShinkaiName(parts[i]));
      }

      return new RegularInbox(inbox, identities);
    } else if (parts[0] === 'job_inbox') {
      if (isE2E) {
        throw new InboxNameError(`Invalid inbox name format: ${inboxName}`);
      }
      const uniqueId = parts[1];
      if (uniqueId === '') {
        throw new InboxNameError(`Invalid inbox name format: ${inboxName}`);
      }
      return new JobInbox(inbox, uniqueId);
    } else {
      throw new InboxNameError(`Invalid inbox name format: ${inboxName}`);
    }
  }

  static fromMessage(message: ShinkaiMessage): InboxName {
    if (!(message.body instanceof UnencryptedMessageBody)) {
      throw new InboxNameError('Expected Unencrypted MessageBody');
    }
    const inboxName = message.body.unencrypted.internal_metadata.inbox;
    return InboxName.parseInboxName(inboxName);
  }

  hasCreationAccess(identityName: ShinkaiName): boolean {
    if (this instanceof RegularInbox) {
      for (const identity of this.identities) {
        if (identity.contains(identityName)) {
          return true;
        }
      }
    } else {
      throw new InboxNameError(
        'has_creation_access is not applicable for JobInbox',
      );
    }
    return false;
  }

  static hasSenderCreationAccess(message: ShinkaiMessage): boolean {
    try {
      const shinkaiName =
        ShinkaiName.fromShinkaiMessageUsingSenderSubidentity(message);

      if (!(message.body instanceof UnencryptedMessageBody)) {
        throw new Error('Expected Unencrypted MessageBody');
      }

      const inboxName = InboxName.fromString(
        message.body.unencrypted.internal_metadata.inbox,
      );
      return inboxName.hasCreationAccess(shinkaiName);
    } catch (err) {
      return false;
    }
  }

  static getRegularInboxNameFromParams(
    sender: string,
    senderSubidentity: string,
    recipient: string,
    recipientSubidentity: string,
    isE2E: boolean,
  ): InboxName {
    const senderFull = senderSubidentity
      ? `${sender}/${senderSubidentity}`
      : sender;
    const recipientFull = recipientSubidentity
      ? `${recipient}/${recipientSubidentity}`
      : recipient;

    const senderName = new ShinkaiName(senderFull);
    const recipientName = new ShinkaiName(recipientFull);

    const inboxNameParts = [
      senderName.getValue(),
      recipientName.getValue(),
    ].sort();
    const inboxName = `inbox::${inboxNameParts[0]}::${inboxNameParts[1]}::${isE2E}`;

    return InboxName.parseInboxName(inboxName);
  }

  static getJobInboxNameFromParams(uniqueId: string): InboxName {
    const inboxName = `job_inbox::${uniqueId}::false`;
    return InboxName.parseInboxName(inboxName);
  }

  getValue(): string {
    return this.value;
  }
}

export class RegularInbox extends InboxName {
  public identities: ShinkaiName[];

  constructor(inboxName: InboxName, identities: ShinkaiName[]) {
    super(inboxName.value, inboxName.isE2E);
    this.identities = identities;
  }
}

export class JobInbox extends InboxName {
  public uniqueId: string;

  constructor(inboxName: InboxName, uniqueId: string) {
    super(inboxName.value, inboxName.isE2E);
    this.uniqueId = uniqueId;
  }
}
