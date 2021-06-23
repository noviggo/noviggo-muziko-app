import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

import Colors from '../constants/Colors';
import { getColor } from '../utilities';

export default function useTheme() {
  const [theme, setTheme] = useState<any>();
  const colorScheme = useColorScheme();
  useEffect(() => {
    colorScheme === 'dark'
      ? changeNavigationBarColor('#000000', false, false)
      : changeNavigationBarColor('#ffffff', true, false);

    const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
    theme.colors.primary = Colors.all.primary;
    theme.colors.card = getColor(colorScheme, 'backgroundCard');
    setTheme(theme);
  }, [colorScheme]);
  return theme;
}
