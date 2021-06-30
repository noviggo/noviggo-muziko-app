import {
  faAlbum,
  faListMusic,
  faPauseCircle,
  faPlayCircle,
  faStepBackward,
  faStepForward,
} from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Animated, ColorSchemeName, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Avatar, Button, LinearProgress } from 'react-native-elements';
import TextTicker from 'react-native-text-ticker';
import { State, useProgress } from 'react-native-track-player';

import Colors from '../constants/Colors';
import { useAppSelector } from '../hooks/useRedux';
import { playPause, skipToNext, skipToPrevious } from '../services/playerService';
import { getCurrentRoute } from '../slices/currentRouteSlice';
import { getNowPlaying } from '../slices/nowPlayingSlice';
import { getPlayerState } from '../slices/playerStateSlice';
import { getColor } from '../utilities';

function TrackProgress() {
  const { position, duration } = useProgress();
  const playerState = useAppSelector(getPlayerState);
  const nowPlaying = useAppSelector(getNowPlaying);
  return (
    <LinearProgress
      color={Colors.all.purple}
      value={!duration || playerState === State.Stopped || !nowPlaying ? 0 : position / duration}
      variant="determinate"
    />
  );
}

export default function NowPlayingMiniScreen() {
  const colorScheme = useColorScheme();
  const currentRoute = useAppSelector(getCurrentRoute);
  const nowPlaying = useAppSelector(getNowPlaying);
  const playerState = useAppSelector(getPlayerState);
  const navigation = useNavigation();
  const styles = getStyles(colorScheme);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    return () => {
      setMounted(false);
    };
  }, []);

  const onPressPlayPause = async () => {
    await playPause();
  };

  const onPressNext = async () => {
    await skipToNext();
  };

  const onPressPrevious = async () => {
    await skipToPrevious();
  };

  const onPressNowPlaying = async () => {
    navigation.navigate('NowPlayingScreen');
  };

  const onPressQueue = async () => {
    navigation.navigate('QueueScreen');
  };

  if (!mounted) return null;
  return (
    <Animated.View
      style={[
        styles.container,
        {
          display: currentRoute === 'NowPlayingScreen' ? 'none' : 'flex',
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <TrackProgress />
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.albumContainer}>
            {nowPlaying?.artwork ? (
              <Avatar
                onPress={onPressNowPlaying}
                size={60}
                placeholderStyle={{ backgroundColor: 'transparent' }}
                source={{ uri: nowPlaying?.artwork }}
              />
            ) : (
              <Avatar
                onPress={onPressNowPlaying}
                size={60}
                placeholderStyle={{ backgroundColor: 'transparent' }}
                renderPlaceholderContent={
                  <FontAwesomeIcon size={40} icon={faAlbum} color={getColor(colorScheme, 'icon')} />
                }
              />
            )}
          </View>
          <View style={styles.trackContainer}>
            <View style={styles.trackInfo}>
              <TouchableOpacity onPress={onPressNowPlaying} activeOpacity={0.8}>
                <TextTicker
                  style={[styles.trackTitle, { color: getColor(colorScheme, 'text') }]}
                  duration={4000}
                  loop
                  bounce
                  repeatSpacer={50}
                  marqueeDelay={4000}
                >
                  {nowPlaying?.title}
                </TextTicker>
                <TextTicker
                  style={[styles.trackArtist, { color: getColor(colorScheme, 'textMuted') }]}
                  duration={4000}
                  loop
                  bounce
                  repeatSpacer={50}
                  marqueeDelay={4000}
                >
                  {nowPlaying?.artist}
                </TextTicker>
              </TouchableOpacity>
            </View>
            <View style={styles.controls}>
              <Button
                onPress={onPressQueue}
                containerStyle={styles.controlButton}
                type="clear"
                icon={<FontAwesomeIcon size={14} color={getColor(colorScheme, 'icon')} icon={faListMusic} />}
              />
              <Button
                onPress={onPressPrevious}
                containerStyle={styles.controlButton}
                type="clear"
                icon={<FontAwesomeIcon size={14} color={getColor(colorScheme, 'icon')} icon={faStepBackward} />}
              />
              <Button
                onPress={onPressPlayPause}
                containerStyle={styles.controlButton}
                type="clear"
                icon={
                  <FontAwesomeIcon
                    size={20}
                    color={getColor(colorScheme, 'icon')}
                    icon={playerState === State.Playing ? faPauseCircle : faPlayCircle}
                  />
                }
              />
              <Button
                onPress={onPressNext}
                containerStyle={styles.controlButton}
                type="clear"
                icon={<FontAwesomeIcon size={14} color={getColor(colorScheme, 'icon')} icon={faStepForward} />}
              />
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const getStyles = (colorScheme: ColorSchemeName) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: getColor(colorScheme, 'backgroundMuted'),
    },
    albumContainer: {
      width: 50,
    },
    albumImage: {
      width: '100%',
      height: undefined,
      aspectRatio: 1,
    },
    trackContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    trackInfo: {
      flex: 1,
      paddingLeft: 20,
      paddingRight: 5,
    },
    trackTitle: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    trackArtist: {
      fontSize: 10,
    },
    controlButton: {
      padding: 2,
      borderRadius: 50,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
  });
