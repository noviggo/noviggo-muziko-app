import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const initialState: string = '';

export const currentRouteSlice = createSlice({
  name: 'currentRoute',
  initialState,
  reducers: {
    setCurrentRoute: (state: string, action: PayloadAction<string>) => {
      return (state = action.payload);
    },
  },
});

export const { setCurrentRoute } = currentRouteSlice.actions;

export const getCurrentRoute = (state: RootState) => state.currentRoute;

export const currentRouteReducer = currentRouteSlice.reducer;
