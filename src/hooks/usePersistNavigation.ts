import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Linking, Platform, useColorScheme } from 'react-native';

import Colors from '../constants/Colors';
import { currentRouteKey } from '../constants/Keys';
import { getColor } from '../utilities';

export interface NavigationState {
  isReady: boolean;
  initialState: any;
  navTheme: Theme;
}

export default function usePersistNavigation() {
  const [initialState, setInitialState] = useState<any>();
  const [isReady, setIsReady] = useState(false);
  const colorScheme = useColorScheme();
  const navTheme = {
    ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: Colors.all.accent,
    },
  };
  navTheme.colors.background = getColor(colorScheme, 'background');
  useEffect(() => {
    const restoreState = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (Platform.OS !== 'web' && initialUrl == null) {
          const savedStateString = await AsyncStorage.getItem(currentRouteKey);
          const state = savedStateString ? JSON.parse(savedStateString) : undefined;

          if (state !== undefined) {
            setInitialState(state);
          }
        }
      } finally {
        setIsReady(true);
      }
    };
    if (!isReady) {
      restoreState();
    }
  }, [isReady, colorScheme]);
  return { isReady, initialState, navTheme } as NavigationState;
}
