import { GetChatConversationOutput } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/types';

export const groupMessagesByDate = (messages: GetChatConversationOutput) => {
  const groupedMessages: Record<string, GetChatConversationOutput> = {};
  for (const message of messages) {
    const date = new Date(message.scheduledTime ?? '').toDateString();
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
    return 'today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'yesterday';
  }
  return date.toDateString();
};
