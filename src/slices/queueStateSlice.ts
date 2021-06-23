import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export type QueueState = { lastUpdated: number };
const initialState: QueueState = { lastUpdated: new Date().getTime() };

export const queueStateSlice = createSlice({
  name: 'queueState',
  initialState,
  reducers: {
    queueUpdated: (state: QueueState) => {
      state.lastUpdated = new Date().getTime();
      return state;
    },
    setQueueState: (state: QueueState, action: PayloadAction<QueueState>) => {
      return (state = action.payload);
    },
  },
});

export const { queueUpdated, setQueueState } = queueStateSlice.actions;

export const getQueueState = (state: RootState) => state.queueState;

export const queueStateReducer = queueStateSlice.reducer;
