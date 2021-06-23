import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const initialState: string = 'transparent';

export const nowPlayingBackgroundSlice = createSlice({
  name: 'nowPlayingBackground',
  initialState,
  reducers: {
    setNowPlayingBackground: (state: string, action: PayloadAction<string>) => {
      return (state = action.payload);
    },
  },
});

export const { setNowPlayingBackground } = nowPlayingBackgroundSlice.actions;

export const getNowPlayingBackground = (state: RootState) => state.nowPlayingBackground;

export const nowPlayingBackgroundReducer = nowPlayingBackgroundSlice.reducer;
