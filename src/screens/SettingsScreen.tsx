import Slider from '@react-native-community/slider';
import LottieView from 'lottie-react-native';
import * as React from 'react';
import { ColorSchemeName, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Button, Input, Switch } from 'react-native-elements';

import Colors from '../constants/Colors';
import { useDatabaseConnection } from '../data/connection';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { clearMediaLibraryCache, syncLocalMediaLibrary, syncRemoteMediaLibrary } from '../services/mediaLibraryService';
import { getLibraryState } from '../slices/libraryStateSlice';
import { getSettings, setRemoteLibraryUrl, setVolume, toggleRemoteLibrary } from '../slices/settingsSlice';
import { getColor } from '../utilities';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);
  return (
    <ScrollView style={styles.container}>
      <PlaybackSettings />
      <SyncSettings />
      <SyncStatus />
      <SyncButton />
    </ScrollView>
  );
}

function PlaybackSettings() {
  const colorScheme = useColorScheme();
  const settings = useAppSelector(getSettings);
  const styles = getStyles(colorScheme);
  const dispatch = useAppDispatch();

  return (
    <>
      <Text style={styles.title}>Playback Settings </Text>
      <View style={styles.card}>
        <View style={styles.cardGroup}>
          <Text style={styles.cardLabel}>Volume</Text>
          <Slider
            style={{ flex: 1 }}
            value={settings.volume}
            onValueChange={value => dispatch(setVolume(value))}
            minimumValue={0}
            maximumValue={1}
            step={0.1}
            maximumTrackTintColor={colorScheme === 'dark' ? Colors.dark.textMuted : Colors.light.textMuted}
            minimumTrackTintColor={Colors.all.primary}
            thumbTintColor={Colors.all.primary}
          />
        </View>
      </View>
    </>
  );
}

function SyncSettings() {
  const colorScheme = useColorScheme();
  const settings = useAppSelector(getSettings);
  const styles = getStyles(colorScheme);
  const dispatch = useAppDispatch();
  return (
    <>
      <Text style={styles.title}> Sync Settings </Text>
      <View style={styles.card}>
        <View style={styles.cardGroup}>
          <Text style={styles.cardLabel}>Use Remote Library?</Text>
          <Switch
            value={settings.useRemoteLibrary}
            onValueChange={() => dispatch(toggleRemoteLibrary())}
            color={Colors.all.accent}
            trackColor={{
              false: getColor(colorScheme, 'backgroundMuted'),
              true: Colors.all.accent,
            }}
          />
        </View>
        {settings.useRemoteLibrary ? (
          <View style={styles.cardGroup}>
            <Input
              label="Library Address"
              style={{ padding: 0 }}
              containerStyle={{ marginLeft: -10, marginBottom: -10 }}
              labelStyle={styles.cardLabel}
              inputStyle={{ fontSize: 16 }}
              onChangeText={value => dispatch(setRemoteLibraryUrl(value))}
              defaultValue={settings.remoteLibraryUrl}
            />
          </View>
        ) : null}
      </View>
    </>
  );
}

function SyncStatus() {
  const colorScheme = useColorScheme();
  const libraryState = useAppSelector(getLibraryState);
  const styles = getStyles(colorScheme);
  return (
    <>
      <Text style={styles.title}> Sync Status </Text>
      <View style={[styles.card, { alignItems: 'center' }]}>
        {libraryState.syncSucceeded ? (
          <LottieView
            source={require('../animations/1798-check-animation.json')}
            autoPlay
            loop={false}
            style={{ height: 120 }}
          />
        ) : (
          <AnimatedCircularProgress
            size={120}
            width={15}
            prefill={libraryState.progress}
            fill={libraryState.progress}
            tintColor={Colors.all.blue}
            backgroundColor={getColor(colorScheme, 'backgroundMuted')}
          >
            {() => (
              <Text style={{ fontSize: 11, color: getColor(colorScheme, 'text') }}>
                {libraryState?.progressMessage}
              </Text>
            )}
          </AnimatedCircularProgress>
        )}
      </View>
    </>
  );
}

function SyncButton() {
  const colorScheme = useColorScheme();
  const settings = useAppSelector(getSettings);
  const libraryState = useAppSelector(getLibraryState);
  const { tracksRepository, albumsRepository, artistsRepository, queueRepository } = useDatabaseConnection();
  const onPressSyncLibrary = async () => {
    try {
      await clearMediaLibraryCache(tracksRepository, artistsRepository, albumsRepository, queueRepository);

      settings.useRemoteLibrary && settings.remoteLibraryUrl
        ? await syncRemoteMediaLibrary(settings.remoteLibraryUrl, tracksRepository, artistsRepository, albumsRepository)
        : await syncLocalMediaLibrary(tracksRepository, artistsRepository, albumsRepository);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <View style={{ marginBottom: 20, marginHorizontal: 10 }}>
      <Button
        disabled={libraryState.isClearing || libraryState.isSyncing}
        disabledStyle={{
          backgroundColor: getColor(colorScheme, 'backgroundMuted'),
        }}
        onPress={onPressSyncLibrary}
        title="Sync Library"
      />
    </View>
  );
}

function getStyles(colorScheme: ColorSchemeName) {
  return StyleSheet.create({
    container: {
      flex: 1
    },
    card: {
      flexDirection: 'column',
      marginTop: 10,
      marginBottom: 20,
      marginHorizontal: 10,
      borderRadius: 10,
      padding: 20,
      backgroundColor: getColor(colorScheme, 'backgroundCard'),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    title: {
      fontSize: 22,
      color: getColor(colorScheme, 'text'),
      marginTop: 15,
      marginHorizontal: 10,
    },
    cardGroup: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 10,
    },
    cardLabel: {
      color: getColor(colorScheme, 'textMuted'),
      fontWeight: 'normal',
      fontSize: 15,
      marginRight: 10,
    },
  });
}
