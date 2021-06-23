import {
  faListMusic,
  faPauseCircle,
  faPlayCircle,
  faStepBackward,
  faStepForward,
} from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Button, Image } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import TextTicker from 'react-native-text-ticker';
import TrackPlayer, { State, useProgress } from 'react-native-track-player';

import Colors from '../constants/Colors';
import { useAppSelector } from '../hooks/useRedux';
import { playPause, skipToNext, skipToPrevious } from '../services/playerService';
import { getNowPlayingBackground } from '../slices/nowPlayingBackgroundSlice';
import { getNowPlaying } from '../slices/nowPlayingSlice';
import { getPlayerState } from '../slices/playerStateSlice';
import { formatDuration, getColor } from '../utilities';

function TrackProgress() {
  const { position, duration } = useProgress();
  const colorScheme = useColorScheme();

  return (
    <View style={styles.progressInfo}>
      <Slider
        value={position ? position : 0}
        minimumValue={0}
        maximumValue={duration ? duration : 0}
        onValueChange={TrackPlayer.seekTo}
        maximumTrackTintColor={colorScheme === 'dark' ? Colors.dark.textMuted : Colors.light.textMuted}
        minimumTrackTintColor={Colors.all.primary}
        thumbTintColor={Colors.all.primary}
      />
      <View style={styles.progressValues}>
        <Text style={[styles.progressValue, { color: getColor(colorScheme, 'textMuted') }]}>
          {formatDuration(position)}
        </Text>
        <Text style={[styles.progressValue, { color: getColor(colorScheme, 'textMuted') }]}>
          {formatDuration(duration)}
        </Text>
      </View>
    </View>
  );
}

export default function NowPlayingScreen() {
  const colorScheme = useColorScheme();
  const nowPlaying = useAppSelector(getNowPlaying);
  const backgroundColor = useAppSelector(getNowPlayingBackground);
  const playerState = useAppSelector(getPlayerState);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1250,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onPressPlayPause = () => {
    playPause();
  };

  const onPressNext = () => {
    skipToNext();
  };

  const onPressPrevious = () => {
    skipToPrevious();
  };

  const onPressQueue = async () => {
    navigation.navigate('QueueScreen');
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={[backgroundColor, 'transparent']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.8 }}
      >
        <View style={styles.albumContainer}>
          <Image
            placeholderStyle={{ backgroundColor: 'transparent' }}
            source={{ uri: nowPlaying?.artwork }}
            style={[styles.albumImage]}
          />
          <Button
            onPress={onPressQueue}
            containerStyle={{
              position: 'absolute',
              right: 20,
              bottom: 0,
              backgroundColor: Colors.all.yellow,
              borderRadius: 50,
            }}
            type="clear"
            icon={<FontAwesomeIcon size={24} color={Colors.dark.text} icon={faListMusic} />}
          />
        </View>
        <View style={styles.trackInfo}>
          <TextTicker
            style={[styles.trackTitle, { color: getColor(colorScheme, 'text') }]}
            duration={3000}
            loop
            bounce
            repeatSpacer={50}
            marqueeDelay={1000}
          >
            {nowPlaying?.title}
          </TextTicker>
          <Text numberOfLines={1} style={[styles.trackArtist, { color: getColor(colorScheme, 'textMuted') }]}>
            {nowPlaying?.artist}
          </Text>
        </View>
        <TrackProgress />
        <View style={styles.controls}>
          <Button
            onPress={onPressPrevious}
            containerStyle={styles.controlButton}
            type="clear"
            icon={<FontAwesomeIcon size={30} color={getColor(colorScheme, 'icon')} icon={faStepBackward} />}
          />
          <Button
            onPress={onPressPlayPause}
            containerStyle={styles.controlButton}
            type="clear"
            icon={
              <FontAwesomeIcon
                size={70}
                color={getColor(colorScheme, 'icon')}
                icon={playerState === State.Playing ? faPauseCircle : faPlayCircle}
              />
            }
          />
          <Button
            onPress={onPressNext}
            containerStyle={styles.controlButton}
            type="clear"
            icon={<FontAwesomeIcon size={30} color={getColor(colorScheme, 'icon')} icon={faStepForward} />}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  albumContainer: {
    flex: 1,
    marginTop: 0,
    padding: 20,
    justifyContent: 'center',
  },
  albumImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  trackInfo: {
    paddingHorizontal: 20,
  },
  trackTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  trackArtist: {
    fontSize: 20,
  },
  progressInfo: {
    padding: 5,
    flexDirection: 'column',
  },
  progressValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  progressValue: {
    fontSize: 12,
  },
  controlButton: {
    padding: 10,
    borderRadius: 50,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 15,
  },
});
