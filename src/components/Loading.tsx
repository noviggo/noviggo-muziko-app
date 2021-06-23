import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import Colors from '../constants/Colors';

export default function Loading() {
  return (
    <View style={{ flex: 1 }}>
      <ActivityIndicator style={{ flex: 1 }} size={50} color={Colors.all.primary} />
    </View>
  );
}
