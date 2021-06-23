import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Connection, createConnection } from 'typeorm';
import { Album, Artist, Queued, Track } from './entities/mediaEntities';
import { AlbumsRepository } from './repositories/albumsRepository';
import { ArtistsRepository } from './repositories/artistsRepository';
import { QueueRepository } from './repositories/queueRepository';
import { TracksRepository } from './repositories/tracksRepository';

interface DatabaseConnectionContextData {
  tracksRepository: TracksRepository;
  albumsRepository: AlbumsRepository;
  artistsRepository: ArtistsRepository;
  queueRepository: QueueRepository;
}

const DatabaseConnectionContext = createContext<DatabaseConnectionContextData>({} as DatabaseConnectionContextData);

export const DatabaseConnectionProvider: React.FC = ({ children }) => {
  const [connection, setConnection] = useState<Connection | null>(null);

  const connect = useCallback(async () => {
    const createdConnection = await createConnection({
      type: 'expo',
      database: 'media_library.db',
      driver: require('expo-sqlite'),
      entities: [Track, Album, Artist, Queued],
      /* migrations: [CreateTracksTable1608217149351],
      migrationsRun: true, */
      synchronize: true,
    });

    setConnection(createdConnection);
  }, [createConnection, setConnection]);

  useEffect(() => {
    if (!connection) {
      connect();
    }
    return () => {
      connection?.close();
    };
  }, [connect, connection]);

  if (!connection) {
    return <ActivityIndicator />;
  }

  return (
    <DatabaseConnectionContext.Provider
      value={{
        tracksRepository: new TracksRepository(connection),
        albumsRepository: new AlbumsRepository(connection),
        artistsRepository: new ArtistsRepository(connection),
        queueRepository: new QueueRepository(connection),
      }}
    >
      {children}
    </DatabaseConnectionContext.Provider>
  );
};

export function useDatabaseConnection() {
  const context = useContext(DatabaseConnectionContext);

  return context;
}
