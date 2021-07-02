import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import * as Device from 'expo-device';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAppSelector } from '../hooks/useRedux';
import { getSettings } from '../slices/settingsSlice';

interface DeviceConnectionContextData {
  devicesConnection: HubConnection | null;
}

const DeviceConnectionContext = createContext<DeviceConnectionContextData>({} as DeviceConnectionContextData);

export const DeviceConnectionProvider: React.FC = ({ children }) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const settings = useAppSelector(getSettings);

  const connect = useCallback(async () => {
    const url = encodeURI(`${settings.remoteLibraryUrl}/muziko/hub/devices?deviceId=${Device.deviceName}`);
    const createdConnection = new HubConnectionBuilder()
      .withUrl(url)
      .configureLogging(LogLevel.Error)
      .withAutomaticReconnect()
      .build();
    await createdConnection.start();
    console.log('Device connection started');
    setConnection(createdConnection);
  }, [setConnection]);

  useEffect(() => {
    if ((!connection || connection.state !== HubConnectionState.Connected) && settings.useRemoteLibrary && settings.remoteLibraryUrl) {
      //connect();
    }
    return () => {
      const shutdownConnection = async () => {
        if (!connection || connection.state !== HubConnectionState.Connected) return;
        console.log('Device connection closed');
        connection.stop();
      };
      //shutdownConnection();
    };
  }, [connect, connection, settings]);

  useEffect(() => {
    if (!connection || connection.state !== HubConnectionState.Connected) return;
    const interval = setInterval(async () => {
      try {
        await connection.invoke('Heartbeat', Device.deviceName);
      } catch (error) {
        console.log(error);
      }
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, [connect, connection]);

  return (
    <DeviceConnectionContext.Provider
      value={{
        devicesConnection: connection,
      }}
    >
      {children}
    </DeviceConnectionContext.Provider>
  );
};

export function useDeviceConnection() {
  const context = useContext(DeviceConnectionContext);

  return context;
}
