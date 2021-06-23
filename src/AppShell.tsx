import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { Event, useTrackPlayerEvents } from 'react-native-track-player';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import usePersistSettings from './hooks/usePersistSettings';
import useTheme from './hooks/useTheme';
import useTrackPlayer from './hooks/useTrackPlayer';
import Navigation from './navigation';
import { trackNowPlaying, trackPlayerState } from './services/playerService';

const playerEvents = [Event.PlaybackState, Event.PlaybackTrackChanged, Event.PlaybackError];
export default function AppShell() {
  const colorScheme = useColorScheme();
  const nowPlayingSubject = new Subject<any>();
  const theme = useTheme();
  enableScreens();
  useTrackPlayer();
  usePersistSettings();
  nowPlayingSubject.pipe(debounceTime(100)).subscribe(async () => {
    await trackNowPlaying();
  });
  useEffect(() => {
    return () => {
      nowPlayingSubject?.unsubscribe();
    };
  }, [nowPlayingSubject]);

  useTrackPlayerEvents(playerEvents, async event => {
    switch (event.type) {
      case Event.PlaybackError:
        console.warn('An error occurred while playing the current track.', event);
        break;
      case Event.PlaybackTrackChanged:
        nowPlayingSubject.next(event);
        break;
      case Event.PlaybackState:
        await trackPlayerState(event.state);
        break;
      default:
        break;
    }
  });

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme} useDark={colorScheme === 'dark'}>
        <Navigation />
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
