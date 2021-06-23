import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import Toast, { BaseToast, BaseToastProps } from 'react-native-toast-message';
import { Event, useTrackPlayerEvents } from 'react-native-track-player';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import Colors from './constants/Colors';
import { useDatabaseConnection } from './data/connection';
import usePersistSettings from './hooks/usePersistSettings';
import useTheme from './hooks/useTheme';
import useTrackPlayer from './hooks/useTrackPlayer';
import Navigation from './navigation';
import { initTrackPlayer, trackNowPlaying, trackPlayerState } from './services/playerService';

const playerEvents = [Event.PlaybackState, Event.PlaybackTrackChanged, Event.PlaybackError];
export default function AppShell() {
  const { queueRepository } = useDatabaseConnection();
  const colorScheme = useColorScheme();
  const nowPlayingSubject = new Subject<any>();
  const theme = useTheme();
  enableScreens();
  useTrackPlayer();
  usePersistSettings();
  const toastConfig = {
    info: ({ text1, text2, ...rest }: BaseToastProps) => (
      <BaseToast
        {...rest}
        style={{
          borderLeftColor: Colors.all.blue,
          backgroundColor: Colors.dark.backgroundCard,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          fontWeight: 'bold',
          color: Colors.dark.text,
        }}
        text2Style={{
          fontSize: 12,
          fontWeight: '400',
          color: Colors.dark.textMuted,
        }}
        text1={text1}
        text2={text2}
      />
    ),
  };
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
        const queue = await queueRepository.getAll();
        await initTrackPlayer(queue);
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
        <Toast ref={ref => Toast.setRef(ref)} config={toastConfig} bottomOffset={10} visibilityTime={2000} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
