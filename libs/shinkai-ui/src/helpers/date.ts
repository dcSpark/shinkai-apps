export type ChatConversationMessage = {
  hash: string;
  parentHash: string;
  inboxId: string;
  scheduledTime: string | undefined;
  content: string;
  isLocal: boolean;
  sender: {
    avatar: string;
  };
  fileInbox?: {
    id: string;
    files: {
      name: string;
    }[];
  };
  workflowName: string | undefined;
};
export type GetChatConversationOutput = ChatConversationMessage[];

export const formatDateToUSLocaleString = (date: Date | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
};
export const formatDateToLocaleStringWithTime = (date: Date | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

export const getRelativeDateLabel = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) {
    return 'today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'yesterday';
  } else {
    return date.toDateString();
  }
};

export const groupMessagesByDate = (messages: ChatConversationMessage[]) => {
  const groupedMessages: Record<string, ChatConversationMessage[]> = {};
  for (const message of messages) {
    const date = new Date(message.scheduledTime ?? '').toDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  }
  return groupedMessages;
};

export const formatDateToMonthAndDay = (date: Date): string => {
  const today = new Date();
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  }
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};
