import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as React from 'react';
import { useColorScheme } from 'react-native';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';

import AlbumsScreen from '../screens/AlbumsScreen';
import ArtistsScreen from '../screens/ArtistsScreen';
import { AlbumsParamList, ArtistsParamList, LibraryParamList } from '../types';
import { getColor } from '../utilities';

const Library = createMaterialTopTabNavigator<LibraryParamList>();

export default function LibraryNavigator() {
  const colorScheme = useColorScheme();

  return (
    <Library.Navigator initialRouteName="Artists" tabBarOptions={{ activeTintColor: getColor(colorScheme, 'tint') }}>
      <Library.Screen name="Artists" component={ArtistsNavigator} />
      <Library.Screen name="Albums" component={AlbumsNavigator} />
    </Library.Navigator>
  );
}

const ArtistsStack = createNativeStackNavigator<ArtistsParamList>();
function ArtistsNavigator() {
  return (
    <ArtistsStack.Navigator>
      <ArtistsStack.Screen name="ArtistsScreen" component={ArtistsScreen} options={{ headerShown: false }} />
    </ArtistsStack.Navigator>
  );
}

const AlbumsStack = createNativeStackNavigator<AlbumsParamList>();
function AlbumsNavigator() {
  return (
    <AlbumsStack.Navigator>
      <AlbumsStack.Screen name="AlbumsScreen" component={AlbumsScreen} options={{ headerShown: false }} />
    </AlbumsStack.Navigator>
  );
}
