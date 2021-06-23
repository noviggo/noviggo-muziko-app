import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const initialState: number = Date.now();

export const libraryRefreshSlice = createSlice({
  name: 'libraryRefresh',
  initialState,
  reducers: {
    libraryRefreshed: (state: number) => {
      return (state = Date.now());
    },
  },
});

export const { libraryRefreshed } = libraryRefreshSlice.actions;

export const getLibraryRefreshed = (state: RootState) => state.libraryRefresh;

export const libraryRefreshReducer = libraryRefreshSlice.reducer;
