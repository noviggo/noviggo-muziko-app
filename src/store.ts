import { configureStore } from '@reduxjs/toolkit';

import { currentRouteReducer } from './slices/currentRouteSlice';
import { libraryStateReducer } from './slices/libraryStateSlice';
import { nowPlayingBackgroundReducer } from './slices/nowPlayingBackgroundSlice';
import { nowPlayingReducer } from './slices/nowPlayingSlice';
import { playerStateReducer } from './slices/playerStateSlice';
import { queueStateReducer } from './slices/queueStateSlice';
import { libraryRefreshReducer } from './slices/libraryRefreshSlice';
import { settingsReducer } from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    nowPlaying: nowPlayingReducer,
    nowPlayingBackground: nowPlayingBackgroundReducer,
    playerState: playerStateReducer,
    currentRoute: currentRouteReducer,
    libraryState: libraryStateReducer,
    queueState: queueStateReducer,
    settings: settingsReducer,
    libraryRefresh: libraryRefreshReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
