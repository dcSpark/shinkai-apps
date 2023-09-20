import { createSlice } from '@reduxjs/toolkit';
import { ShinkaiMessage } from '@shinkai/shinkai-message-ts/models';
import { calculateMessageHash } from '@shinkai/shinkai-message-ts/utils';

import {
  createInbox,
  getAllInboxes,
  getLastsMessagesForInbox,
  sendMessage,
} from './inbox-actions';
import { InboxState } from './inbox-types';

const initialState: InboxState = {
  all: {
    status: 'idle',
  },
  create: {
    status: 'idle',
  },
  messages: {},
  messagesHashes: {},
};

export const inboxSlice = createSlice({
  name: 'inbox',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getAllInboxes.pending, (state, action) => {
        state.all.status = 'loading';
      })
      .addCase(getAllInboxes.fulfilled, (state, action) => {
        state.all.status = 'succeeded';
        state.all.data = action.payload;
      })
      .addCase(getAllInboxes.rejected, (state, action) => {
        state.all.status = 'failed';
        state.all.error = action.error.message;
      });

    builder
      .addCase(createInbox.pending, (state, action) => {
        state.create.status = 'loading';
      })
      .addCase(createInbox.fulfilled, (state, action) => {
        state.create.status = 'succeeded';
        state.create.data = action.payload;
        state.all.data = [...(state.all.data || []), action.payload.inbox];
      })
      .addCase(createInbox.rejected, (state, action) => {
        state.create.status = 'failed';
        state.create.error = action.error.message;
      });

    builder
      .addCase(getLastsMessagesForInbox.pending, (state, action) => {
        state.messages[action.meta.arg.inboxId] = {
          ...state.messages[action.meta.arg.inboxId],
          status: 'loading',
        };
      })
      .addCase(getLastsMessagesForInbox.fulfilled, (state, action) => {
        state.messages[action.meta.arg.inboxId] = {
          ...state.messages[action.meta.arg.inboxId],
          status: 'succeeded',
        };
        const inboxId = action.payload.inboxId;
        const currentMessages = state.messages[inboxId]?.data || [];
        const currentMessagesHashes = state.messagesHashes[inboxId] || {};
        const newMessages = action.payload.messages.filter(
          (msg: ShinkaiMessage) => {
            const hash = calculateMessageHash(msg);
            if (currentMessagesHashes[hash]) {
              return false;
            } else {
              currentMessagesHashes[hash] = true;
              return true;
            }
          }
        );
        state.messages[inboxId].data = [...currentMessages, ...newMessages];
        state.messagesHashes[inboxId] = currentMessagesHashes;
      })
      .addCase(getLastsMessagesForInbox.rejected, (state, action) => {
        state.messages[action.meta.arg.inboxId] = {
          ...state.messages[action.meta.arg.inboxId],
          status: 'failed',
          error: action.error.message,
        };
      });
    
    builder
      .addCase(sendMessage.pending, (state, action) => {
        state.messages[action.meta.arg.inboxId] = {
          ...state.messages[action.meta.arg.inboxId],
          status: 'loading',
        };
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages[action.meta.arg.inboxId] = {
          ...state.messages[action.meta.arg.inboxId],
          status: 'succeeded',
        };
        const inboxId = action.payload.inbox.id;
        const currentMessages = state.messages[inboxId]?.data || [];
        const currentMessagesHashes = state.messagesHashes[inboxId] || {};
        const newMessages = [action.payload.message].filter(
          (msg: ShinkaiMessage) => {
            const hash = calculateMessageHash(msg);
            if (currentMessagesHashes[hash]) {
              return false;
            } else {
              currentMessagesHashes[hash] = true;
              return true;
            }
          }
        );
        state.messages[inboxId].data = [...currentMessages, ...newMessages];
        state.messagesHashes[inboxId] = currentMessagesHashes;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.messages[action.meta.arg.inboxId] = {
          ...state.messages[action.meta.arg.inboxId],
          status: 'failed',
          error: action.error.message,
        };
      });
  },
});
