import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export type LibraryState = {
  isSyncing: boolean;
  syncSucceeded: boolean;
  isClearing: boolean;
  syncCount: number;
  progress: number;
  progressMessage: string;
  total: number;
  lastUpdated: number;
};
const initialState: LibraryState = {
  syncSucceeded: false,
  isSyncing: false,
  isClearing: false,
  progressMessage: 'Not started',
  syncCount: 0,
  progress: 0,
  total: 0,
  lastUpdated: new Date().getTime(),
};

export const libraryStateSlice = createSlice({
  name: 'libraryState',
  initialState,
  reducers: {
    updateLibraryState: (state: LibraryState) => {
      state.lastUpdated = new Date().getTime();
      return state;
    },
    clearingLibraryState: (state: LibraryState) => {
      state.isSyncing = false;
      state.isClearing = true;
      state.progressMessage = 'Clearing';
      state.lastUpdated = new Date().getTime();
      return state;
    },
    resetLibraryState: (state: LibraryState) => {
      state = initialState;
      return state;
    },
    setLibraryState: (state: LibraryState, action: PayloadAction<LibraryState>) => {
      return (state = action.payload);
    },
    syncIncrement: (state: LibraryState) => {
      state.syncCount += 1;
      state.progress = (state.syncCount / state.total) * 100;
      state.progressMessage = `${state?.syncCount} / ${state?.total}`;
      state.lastUpdated = new Date().getTime();
      return state;
    },
    syncStart: (state: LibraryState, action: PayloadAction<number>) => {
      state.isSyncing = true;
      state.isClearing = false;
      state.progressMessage = 'Starting';
      state.total = action.payload;
      state.lastUpdated = new Date().getTime();
      return state;
    },
    syncSaving: (state: LibraryState, action: PayloadAction<string>) => {
      state.lastUpdated = new Date().getTime();
      state.progressMessage = action.payload;
      return state;
    },
    syncFailed: (state: LibraryState, action: PayloadAction<string>) => {
      state.isSyncing = false;
      state.isClearing = false;
      state.lastUpdated = new Date().getTime();
      state.progressMessage = action.payload;
      state.syncSucceeded = false;
      return state;
    },
    syncComplete: (state: LibraryState) => {
      state.isSyncing = false;
      state.lastUpdated = new Date().getTime();
      state.progressMessage = `Completed`;
      state.syncSucceeded = true;
      return state;
    },
  },
});

export const {
  setLibraryState,
  syncStart,
  syncSaving,
  syncComplete,
  syncFailed,
  syncIncrement,
  updateLibraryState,
  resetLibraryState,
  clearingLibraryState,
} = libraryStateSlice.actions;

export const getLibraryState = (state: RootState) => state.libraryState;

export const libraryStateReducer = libraryStateSlice.reducer;
