import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import * as Device from 'expo-device';
import * as React from 'react';
import { useEffect, useState } from 'react';

export default function useDeviceConnection() {
  const [hubConnection, setHubConnection] = useState<HubConnection>();

  useEffect(() => {
    const createHubConnection = async () => {
      const hubConnection = new HubConnectionBuilder()
        .withUrl(`http://192.168.0.101:5000/muziko/hub/devices?deviceId=${Device.deviceName}`)
        .configureLogging(LogLevel.Error)
        .withAutomaticReconnect()
        .build();
      try {
        await hubConnection.start();
      } catch (err) {
        console.log('Error while establishing connection: ' + { err });
      }
      setHubConnection(hubConnection);
    };
    createHubConnection();
    return () => {
      if (hubConnection) hubConnection.stop();
    };
  }, []);

  return hubConnection;
}
