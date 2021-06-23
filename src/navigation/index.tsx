import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, NavigationContainerRef, NavigationState } from '@react-navigation/native';
import * as React from 'react';
import { useRef } from 'react';

import Loading from '../components/Loading';
import { currentRouteKey } from '../constants/Keys';
import usePersistNavigation from '../hooks/usePersistNavigation';
import { useAppDispatch } from '../hooks/useRedux';
import { setCurrentRoute } from '../slices/currentRouteSlice';
import LinkingConfiguration from './LinkingConfiguration';
import RootNavigator from './RootNavigator';

export default function Navigation() {
  const navigationRef = useRef<NavigationContainerRef>(null);
  const dispatch = useAppDispatch();
  const navState = usePersistNavigation();
  const onStateChange = (state?: NavigationState) => {
    const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
    dispatch(setCurrentRoute(currentRoute ? currentRoute : ''));
    if (state) AsyncStorage.setItem(currentRouteKey, JSON.stringify(state));
  };
  if (!navState.isReady) return <Loading />;
  return (
    <NavigationContainer
      ref={navigationRef}
      linking={LinkingConfiguration}
      theme={navState.navTheme}
      initialState={navState.initialState}
      onReady={onStateChange}
      onStateChange={onStateChange}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}
