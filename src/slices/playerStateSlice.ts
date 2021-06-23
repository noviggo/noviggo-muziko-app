import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { State } from 'react-native-track-player';

import type { RootState } from '../store';
const initialState: State = State.None;

export const playerStateSlice = createSlice({
  name: 'playerState',
  initialState,
  reducers: {
    setPlayerState: (state: State, action: PayloadAction<State>) => {
      return (state = action.payload);
    },
  },
});

export const { setPlayerState } = playerStateSlice.actions;

export const getPlayerState = (state: RootState) => state.playerState;

export const playerStateReducer = playerStateSlice.reducer;
