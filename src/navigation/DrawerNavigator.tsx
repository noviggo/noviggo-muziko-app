import { faAlbumCollection, faCogs, faListMusic, faUserMusic } from '@fortawesome/pro-duotone-svg-icons';
import { faBars } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { DrawerActions, useNavigation } from '@react-navigation/core';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentOptions,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import * as React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Avatar, Button } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';

import Colors from '../constants/Colors';
import { useAppSelector } from '../hooks/useRedux';
import AlbumTracksScreen from '../screens/AlbumTracksScreen';
import ArtistAlbumsScreen from '../screens/ArtistAlbumsScreen';
import NowPlayingMiniScreen from '../screens/NowPlayingMiniScreen';
import NowPlayingScreen from '../screens/NowPlayingScreen';
import QueueScreen from '../screens/QueueScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { getCurrentRoute } from '../slices/currentRouteSlice';
import { getNowPlayingBackground } from '../slices/nowPlayingBackgroundSlice';
import { getNowPlaying } from '../slices/nowPlayingSlice';
import { DrawerParamList, NavParamList } from '../types';
import { getColor } from '../utilities';
import LibraryNavigator from './LibraryNavigator';

const Drawer = createDrawerNavigator<DrawerParamList>();
const NavStack = createNativeStackNavigator<NavParamList>();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: true }} drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="NavStackNavigator"
        component={NavStackNavigator}
        options={() => ({
          headerShown: false,
        })}
      />
    </Drawer.Navigator>
  );
}

function NavStackNavigator() {
  const navigation = useNavigation();
  return (
    <>
      <NavStack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.all.primary,
          },
          headerTintColor: '#fff',
        }}
      >
        <NavStack.Screen
          name="Library"
          component={LibraryNavigator}
          options={{
            headerShown: true,
            headerLeft: () => (
              <View style={{flexDirection: "row", alignItems:"center"}}>
                <Button
                  type="clear"
                  containerStyle={{ borderRadius: 50 }}
                  onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                  icon={<FontAwesomeIcon size={20} icon={faBars} color="white" />}
                />
                <Text style={{fontWeight: "bold", fontSize: 20, color: "white", marginLeft: 25}}>Library</Text>
              </View>
            ),
          }}
        />
        <NavStack.Screen name="QueueScreen" component={QueueScreen} options={{ title: 'Queue' }} />
        <NavStack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'Settings' }} />
        <NavStack.Screen name="ArtistAlbumsScreen" component={ArtistAlbumsScreen} options={{ title: '' }} />
        <NavStack.Screen name="AlbumTracksScreen" component={AlbumTracksScreen} options={{ title: '' }} />
        <NavStack.Screen name="NowPlayingScreen" component={NowPlayingScreen} options={{ headerShown: false }} />
      </NavStack.Navigator>
      <NowPlayingMiniScreen />
    </>
  );
}
function CustomDrawerContent(props: DrawerContentComponentProps<DrawerContentOptions>) {
  const currentRoute = useAppSelector(getCurrentRoute);
  const nowPlaying = useAppSelector(getNowPlaying);
  const nowPlayingBackground = useAppSelector(getNowPlayingBackground);
  const colorScheme = useColorScheme();
  return (
    <>
      <LinearGradient
        useAngle={true}
        angle={160}
        angleCenter={{ x: 0.5, y: 0.5 }}
        colors={[nowPlayingBackground ? nowPlayingBackground : Colors.all.primary, Colors.all.purple]}
        style={{
          height: 130,
          padding: 15,
          paddingTop: 35,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: -20,
        }}
      >
        <View>
          {nowPlaying?.artwork ? (
            <Avatar
              rounded
              size={60}
              placeholderStyle={{ backgroundColor: 'transparent' }}
              source={{ uri: nowPlaying?.artwork }}
            />
          ) : null}
        </View>

        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <Text numberOfLines={2} style={{ color: Colors.dark.text, fontWeight: 'bold' }}>
            {nowPlaying?.title}
          </Text>
          <Text style={{ color: Colors.dark.textMuted, fontSize: 11 }}>{nowPlaying?.artist}</Text>
        </View>
      </LinearGradient>

      <DrawerContentScrollView {...props}>
        <DrawerItem
          label="Artists"
          onPress={() => props.navigation.navigate('Artists')}
          focused={currentRoute.startsWith('Artists')}
          icon={({ color, size }) => <FontAwesomeIcon color={color} size={size} icon={faUserMusic} />}
        />
        <DrawerItem
          label="Albums"
          onPress={() => props.navigation.navigate('Albums')}
          focused={currentRoute.startsWith('Albums')}
          icon={({ color, size }) => <FontAwesomeIcon color={color} size={size} icon={faAlbumCollection} />}
        />
        <View style={[styles.separator, { backgroundColor: getColor(colorScheme, 'backgroundMuted') }]} />

        <DrawerItem
          label="Queue"
          onPress={() => props.navigation.navigate('QueueScreen')}
          focused={currentRoute.startsWith('QueueScreen')}
          icon={({ color, size }) => <FontAwesomeIcon color={color} size={size} icon={faListMusic} />}
        />
        <DrawerItem
          label="Settings"
          onPress={() => props.navigation.navigate('SettingsScreen')}
          focused={currentRoute.startsWith('SettingsScreen')}
          icon={({ color, size }) => <FontAwesomeIcon color={color} size={size} icon={faCogs} />}
        />
      </DrawerContentScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  separator: {
    marginVertical: 5,
    height: 1,
    backgroundColor: 'rgba(255,255,255,.2)',
  },
});
