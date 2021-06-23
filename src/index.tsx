import { Buffer } from 'buffer';
import * as React from 'react';
import { LogBox } from 'react-native';
import { Provider } from 'react-redux';

import AppShell from './AppShell';
import Loading from './components/Loading';
import { DatabaseConnectionProvider } from './data/connection';
import { store } from './store';

LogBox.ignoreLogs(["Accessing the 'state' property of the 'route' object is not supported."]);
LogBox.ignoreLogs(['Setting a timer']);
global.Buffer = Buffer;

export default function App() {
  return (
    <DatabaseConnectionProvider>
      <Provider store={store}>
        <React.Suspense fallback={<Loading />}>
          <AppShell />
        </React.Suspense>
      </Provider>
    </DatabaseConnectionProvider>
  );
}
