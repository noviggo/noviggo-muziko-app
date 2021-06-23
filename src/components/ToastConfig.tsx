import React from 'react';
import { BaseToast, BaseToastProps } from 'react-native-toast-message';

import Colors from '../constants/Colors';

export const ToastConfig = {
  info: ({ text1, text2, ...rest }: BaseToastProps) => (
    <BaseToast
      {...rest}
      style={{
        borderLeftColor: Colors.all.blue,
        backgroundColor: Colors.dark.backgroundCard,
      }}
      trailingIcon={{}}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.dark.text,
      }}
      text2Style={{
        fontSize: 12,
        fontWeight: '400',
        color: Colors.dark.textMuted,
      }}
      text1={text1}
      text2={text2}
    />
  ),
};
