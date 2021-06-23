/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

export type RootStackParamList = {
  Root: undefined;
  NotFound: undefined;
};

export type LibraryParamList = {
  Artists: undefined;
  Albums: undefined;
  Tracks: undefined;
};

export type ArtistsParamList = {
  ArtistsScreen: undefined;
};

export type AlbumsParamList = {
  AlbumsScreen: undefined;
};

export type TracksParamList = {
  TracksScreen: undefined;
};

export type DrawerParamList = {
  NavStackNavigator: undefined;
};

export type NavParamList = {
  Library: undefined;
  QueueScreen: undefined;
  SettingsScreen: undefined;
  NowPlayingScreen: undefined;
  ArtistAlbumsScreen: { artistId: string };
  AlbumTracksScreen: { albumId: string };
};
