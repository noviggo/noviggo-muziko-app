import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Queued } from '../data/entities/mediaEntities';
import type { RootState } from '../store';

export type NowPlayingState = Queued | null;
const initialState: NowPlayingState = null as NowPlayingState;

export const nowPlayingSlice = createSlice({
  name: 'nowPlaying',
  initialState,
  reducers: {
    setNowPlaying: (state: Queued | null | undefined, action: PayloadAction<Queued | null | undefined>) => {
      return (state = action.payload);
    },
  },
});

export const { setNowPlaying } = nowPlayingSlice.actions;

export const getNowPlaying = (state: RootState) => state.nowPlaying;

export const nowPlayingReducer = nowPlayingSlice.reducer;
