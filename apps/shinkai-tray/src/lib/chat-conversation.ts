import type { ShinkaiMessage } from "@shinkai_network/shinkai-message-ts/models";

export const groupMessagesByDate = (messages: ShinkaiMessage[]) => {
  const groupedMessages: Record<string, ShinkaiMessage[]> = {};
  for (const message of messages) {
    const date = new Date(message.external_metadata?.scheduled_time ?? "").toDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  }
  return groupedMessages;
};

export const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) {
    return "today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "yesterday";
  }
  return date.toDateString();
};
