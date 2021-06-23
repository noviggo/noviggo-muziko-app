import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../store';

export type Settings = { useRemoteLibrary: boolean; remoteLibraryUrl?: string; volume: number };
const initialState: Settings = { useRemoteLibrary: true, remoteLibraryUrl: 'http://192.168.0.101:5000', volume: 1 };

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state: Settings, action: PayloadAction<Settings>) => {
      state = action.payload;
      return (state = action.payload);
    },
    toggleRemoteLibrary: (state: Settings) => {
      state.useRemoteLibrary = !state.useRemoteLibrary;
      return state;
    },
    setRemoteLibraryUrl: (state: Settings, action: PayloadAction<string>) => {
      state.remoteLibraryUrl = action.payload;
      return state;
    },
    setVolume: (state: Settings, action: PayloadAction<number>) => {
      state.volume = Math.round(action.payload * 10) / 10;
      return state;
    },
  },
});

export const { setSettings, toggleRemoteLibrary, setRemoteLibraryUrl, setVolume } = settingsSlice.actions;

export const getSettings = (state: RootState) => state.settings;

export const settingsReducer = settingsSlice.reducer;
