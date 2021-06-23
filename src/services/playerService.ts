import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { Capability, State } from 'react-native-track-player';

import { nowPlayingPositionKey } from '../constants/Keys';
import { Queued } from '../data/entities/mediaEntities';
import { setNowPlayingBackground } from '../slices/nowPlayingBackgroundSlice';
import { setNowPlaying } from '../slices/nowPlayingSlice';
import { setPlayerState } from '../slices/playerStateSlice';
import { store } from '../store';
import { getImageColor } from '../utilities';

export async function initTrackPlayer(queue: Queued[]) {
  TrackPlayer.destroy();
  await TrackPlayer.setupPlayer({
    maxCacheSize: 5120,
    minBuffer: 5,
  });
  console.log('Player Registered');
  if (queue.length > 0) {
    await TrackPlayer.reset();
    await TrackPlayer.add(queue);
    const nowPlayingPositionValue = await AsyncStorage.getItem(nowPlayingPositionKey);
    const nowPlayingPosition = nowPlayingPositionValue ? parseInt(nowPlayingPositionValue) : 0;
    if (queue.length > nowPlayingPosition) {
      await TrackPlayer.skip(nowPlayingPosition);
    }
  }
  await TrackPlayer.updateOptions({
    stopWithApp: true,
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.Stop,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious],
  });
}

export async function playPause() {
  const playerState = await TrackPlayer.getState();
  if (playerState === State.Playing) {
    await TrackPlayer.pause();
  } else if (playerState === State.Paused) {
    await TrackPlayer.play();
  }
}

export async function skipToNext() {
  const queue = await TrackPlayer.getQueue();
  const currentTrack = await TrackPlayer.getCurrentTrack();
  if (currentTrack < queue.length - 1) {
    await TrackPlayer.skipToNext();
  }
}

export async function skipToPrevious() {
  const currentTrack = await TrackPlayer.getCurrentTrack();
  if (currentTrack > 0) {
    await TrackPlayer.skipToPrevious();
  }
}

export async function skip(queued: Queued) {
  const currentTrack = await TrackPlayer.getCurrentTrack();
  if (queued.order === currentTrack) {
    await TrackPlayer.seekTo(0);
  }
  await TrackPlayer.skip(queued.order);
  await TrackPlayer.play();
}

export async function trackNowPlaying() {
  const order = await TrackPlayer.getCurrentTrack();
  if (order === null) return;
  const track = await TrackPlayer.getTrack(order);
  const backgroundColor = await getImageColor(track.artwork as string);
  store.dispatch(setNowPlaying(track as Queued));
  store.dispatch(setNowPlayingBackground(backgroundColor));
  order ? await AsyncStorage.setItem(nowPlayingPositionKey, order.toString()) : null;
}

export async function clearNowPlaying() {
  await TrackPlayer.stop();
  await TrackPlayer.reset();
  await AsyncStorage.removeItem(nowPlayingPositionKey);
  store.dispatch(setNowPlaying(null));
  store.dispatch(setNowPlayingBackground('transparent'));
}

export async function trackPlayerState(state: State) {
  store.dispatch(setPlayerState(state));
}
