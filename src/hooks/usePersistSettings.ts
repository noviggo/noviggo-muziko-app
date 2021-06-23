import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';
import { useEffect, useState } from 'react';
import TrackPlayer from 'react-native-track-player';

import { settingsKey } from '../constants/Keys';
import { getSettings, setSettings } from '../slices/settingsSlice';
import { useAppDispatch, useAppSelector } from './useRedux';

export default function usePersistSettings() {
  const dispatch = useAppDispatch();
  const [isReady, setIsReady] = useState(false);
  const settings = useAppSelector(getSettings);
  useEffect(() => {
    const restoreSettings = async () => {
      try {
        const settingsValue = await AsyncStorage.getItem(settingsKey);
        const settings = settingsValue ? JSON.parse(settingsValue) : undefined;
        if (settings !== undefined) dispatch(setSettings(settings));
      } finally {
        setIsReady(true);
      }
    };
    if (!isReady) {
      restoreSettings();
    }
  }, [isReady]);
  useEffect(() => {
    const setSettingEffects = async () => {
      if (!settings) return;
      await AsyncStorage.setItem(settingsKey, JSON.stringify(settings));
      const volume = await TrackPlayer.getVolume();
      if (volume !== settings.volume) await TrackPlayer.setVolume(settings.volume);
    };
    if (isReady) {
      setSettingEffects();
    }
  }, [settings, isReady]);
}
