import { intervalToDuration } from 'date-fns';
import { ColorSchemeName, StyleSheet } from 'react-native';
import ImageColors from 'react-native-image-colors';

import Colors from './constants/Colors';

export function formatDuration(secondDuration: number) {
  const duration = intervalToDuration({ start: 0, end: secondDuration * 1000 });
  const seconds = duration.seconds ? `${duration.seconds < 10 ? '0' : ''}${duration.seconds}` : '00';
  const minutes = duration.minutes ? `${duration.minutes < 10 ? '0' : ''}${duration.minutes}:` : '00:';
  const hours = duration.hours ? `${duration.hours < 10 ? '0' : ''}${duration.hours}:` : '';
  const days = duration.days ? `${duration.days}:` : '';
  return `${days}${hours}${minutes}${seconds}`;
}

export function getColor(
  colorScheme: ColorSchemeName,
  property:
    | 'text'
    | 'textMuted'
    | 'textSubtitle'
    | 'background'
    | 'tint'
    | 'tabIconDefault'
    | 'tabIconSelected'
    | 'icon'
    | 'backgroundMuted'
    | 'backgroundCard'
    | 'selectBackground'
) {
  const colorSchemeName = colorScheme ? colorScheme : 'light';
  return Colors[colorSchemeName][property];
}

export async function getImageColor(path?: string, fallback: string = 'transparent') {
  let color = fallback;
  if (!path) return color;
  const colors = await ImageColors.getColors(path, {
    fallback: fallback,
    cache: true,
    key: path,
  });
  if (colors.platform === 'android' && colors?.average) {
    color = colors.average;
  } else if (colors.platform === 'ios' && colors?.background) {
    color = colors.background;
  }
  return color;
}

export function getShadowStyle() {
  return StyleSheet.create({
    shadowLight: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
  });
}

export function getListScreenStyles(colorScheme: ColorSchemeName) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 5,
    },
    list: { flex: 1 },
    listTitle: {
      fontSize: 15,
      color: getColor(colorScheme, 'text'),
    },
    listSubtitle: {
      fontSize: 11,
      color: getColor(colorScheme, 'textSubtitle'),
    },
    listContents: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    listContentsLeft: {
      flex: 1,
      marginRight: 'auto',
    },
    listContentsRight: {
      marginLeft: 5,
      flexDirection: 'row',
      alignItems: 'center',
    },
    listItemContainer: {
      backgroundColor: getColor(colorScheme, 'backgroundCard'),
      marginVertical: 8,
      marginHorizontal: 4,
      borderRadius: 10,
      padding: 0,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    listItemDuration: {
      marginRight: 5,
      fontSize: 12,
      color: getColor(colorScheme, 'textMuted'),
    },
    listItemButton: {
      borderRadius: 50,
    },
    listItemActionRight: {
      alignSelf: 'flex-end',
      justifyContent: 'center',
      height: '100%',
      marginRight: 15,
    },
    listItemActionLeft: {
      alignSelf: 'flex-end',
      justifyContent: 'center',
      height: '100%',
      marginLeft: 15,
    },
    header: {
      flexDirection: 'row',
      marginVertical: 10,
      marginHorizontal: 4,
      borderRadius: 10,
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
    headerImage: {
      alignItems: 'center',
    },
    headerContents: {
      flex: 1,
      flexDirection: 'column',
      padding: 10,
    },
    headerTitle: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 10,
      color: getColor(colorScheme, 'text'),
    },
    headerDetails: {
      fontSize: 13,
      color: getColor(colorScheme, 'textMuted'),
    },
    headerDetailGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    placeholder: {
      backgroundColor: 'transparent',
    },
  });
}

export function getCardStyle(colorScheme: ColorSchemeName) {
  return StyleSheet.create({
    card: {
      flexDirection: 'column',
      marginTop: 10,
      marginBottom: 20,
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
  });
}
