export function validateInboxName(s: string): boolean {
  const parts = s.split("::");

  if (parts.length !== 4) {
    return false;
  }

  const isE2e = parts[3] === "true" || parts[3] === "false";

  const senderParts = parts[1].split("|");
  const recipientParts = parts[2].split("|");

  if (senderParts.length !== 2 || recipientParts.length !== 2) {
    return false;
  }

  return isE2e;
}
