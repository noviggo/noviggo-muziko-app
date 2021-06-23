import * as React from 'react';
import { useEffect } from 'react';
import TrackPlayer from 'react-native-track-player';

import { useDatabaseConnection } from '../data/connection';
import { initTrackPlayer } from '../services/playerService';

export default function useTrackPlayer() {
  const { queueRepository } = useDatabaseConnection();
  const [isLoading, setIsLoading] = React.useState(true);
  useEffect(() => {
    async function setupTrackPlayer() {
      try {
        const queue = await queueRepository.getAll();
        await initTrackPlayer(queue);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoading(false);
      }
    }
    setupTrackPlayer();
    return () => {
      const shutdownPlayer = async () => {
        console.log('Player Unmounted');
        await TrackPlayer.stop();
        TrackPlayer.destroy();
      };
      shutdownPlayer();
    };
  }, []);
  return isLoading;
}
