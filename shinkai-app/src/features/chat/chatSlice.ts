// src/features/chat/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/main';

interface ChatState {
  messages: any[]; // Replace any with the type of your messages
}

const initialState: ChatState = {
  messages: [],
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<any>) => { // Replace any with the type of your messages
      state.messages.push(action.payload);
    },
  },
});

export const { addMessage } = chatSlice.actions;

export const selectMessages = (state: RootState) => state.chat.messages;

export default chatSlice.reducer;
