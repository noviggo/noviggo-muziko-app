import axios from 'axios';
import * as MediaLibrary from 'expo-media-library';
import * as mm from 'music-metadata/lib/core';
import { IAudioMetadata } from 'music-metadata/lib/type';
import * as queryString from 'query-string';
import { SPOTIFY_KEYS } from 'react-native-dotenv';
import { FileSystem } from 'react-native-unimodules';
import SpotifyWebApi from 'spotify-web-api-js';
import { v4 as uuidv4 } from 'uuid';

import { ApiResponse } from '../data/entities/apiEntities';
import { Album, Artist, Track } from '../data/entities/mediaEntities';
import { AlbumsRepository } from '../data/repositories/albumsRepository';
import { ArtistsRepository } from '../data/repositories/artistsRepository';
import { QueueRepository } from '../data/repositories/queueRepository';
import { TracksRepository } from '../data/repositories/tracksRepository';
import { libraryRefreshed } from '../slices/libraryRefreshSlice';
import {
  clearingLibraryState,
  resetLibraryState,
  syncComplete,
  syncFailed,
  syncIncrement,
  syncSaving,
  syncStart,
} from '../slices/libraryStateSlice';
import { store } from '../store';

export async function getTagInfo(uri: string, includeCovers: boolean = false): Promise<IAudioMetadata | undefined> {
  const chunkSize = (includeCovers ? 1024 : 48) * 1024;
  const buffer = Buffer.alloc(chunkSize * 2, undefined, 'base64');
  try {
    const chunk = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
      position: 0,
      length: chunkSize,
    });
    buffer.write(chunk as string, 'base64');
    const info = await mm.parseBuffer(buffer, getAudioMimeType(uri), {
      skipCovers: !includeCovers,
      skipPostHeaders: true,
    });
    if (info.common.artist) {
      return info;
    }
  } catch (error) {
    console.log(error);
    console.log(uri);
  }
}

export async function getCoverImage(uri: string) {
  const trackInfo = await getTagInfo(uri, true);
  if (trackInfo?.common.picture && trackInfo.common.picture.length > 0) {
    const image = trackInfo.common.picture[0];
    return image;
  }
}

export async function getLocalCoverImage(album: Album, track: Track) {
  const image = await getCoverImage(track.url);
  if (!image) return;
  const filename = `${FileSystem.documentDirectory}${album.id}`;
  await FileSystem.writeAsStringAsync(filename, image.data.toString('base64'), {
    encoding: FileSystem.EncodingType.Base64,
  });
  album.artwork = filename;
}

export async function getRemoteCoverImage(serverUrl: string, album: Album, track: Track) {
  const filename = `${FileSystem.documentDirectory}${album.id}`;
  const downloadResults = await FileSystem.downloadAsync(`${serverUrl}muziko/api/tracks/${track.id}/artwork`, filename);
  if (downloadResults.status < 300) album.artwork = filename;
}

export async function getSpotifyCoverImage(album: Album, track: Track, spotifyClient: SpotifyWebApi.SpotifyWebApiJs) {
  const trackLookup = await spotifyClient.searchTracks(`artist:${track.artist} track:${track.title}`);
  if (trackLookup && trackLookup.tracks.total > 0) {
    const filename = `${FileSystem.documentDirectory}${album.id}`;
    FileSystem.downloadAsync(trackLookup.tracks.items[0].album.images[0].url, filename);
    album.artwork = filename;
  }
}

export async function getSpotifyArtistImage(
  artist: Artist,
  track: Track,
  spotifyClient: SpotifyWebApi.SpotifyWebApiJs
) {
  const trackLookup = await spotifyClient.searchTracks(`artist:${track.artist} track:${track.title}`);
  if (trackLookup && trackLookup.tracks.total > 0) {
    const artistLookup = await spotifyClient.getArtist(trackLookup.tracks.items[0].artists[0].id);
    const filename = `${FileSystem.documentDirectory}${artist.id}`;
    FileSystem.downloadAsync(artistLookup.images[0].url, filename);
    artist.artwork = filename;
  }
}

export async function clearMediaLibraryCache(
  tracksRepository: TracksRepository,
  artistsRepository: ArtistsRepository,
  albumsRepository: AlbumsRepository,
  queueRepository: QueueRepository
) {
  store.dispatch(resetLibraryState());
  store.dispatch(clearingLibraryState());
  const directory = FileSystem.documentDirectory;
  if (directory) {
    const directoryInfo = await FileSystem.readDirectoryAsync(directory);
    for (let index = 0; index < directoryInfo.length; index++) {
      const fileInfo = directoryInfo[index];
      if (fileInfo.toLowerCase() !== 'sqlite') {
        await FileSystem.deleteAsync(`${directory}${fileInfo}`);
      }
    }
  }
  await tracksRepository.deleteAll();
  await albumsRepository.deleteAll();
  await artistsRepository.deleteAll();
  await queueRepository.clear();
}

export async function getSpotifyClient() {
  var client = new SpotifyWebApi();
  const spotifyKeys = SPOTIFY_KEYS;

  const spotifyToken = await axios.post(
    'https://accounts.spotify.com/api/token',
    queryString.stringify({ grant_type: 'client_credentials' }),
    {
      headers: {
        Authorization: `Basic ${spotifyKeys}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  client.setAccessToken(spotifyToken.data['access_token']);
  return client;
}

export function getServerClient(serverUrl: string) {
  const client = axios.create({ baseURL: serverUrl, headers: { 'Content-Type': 'application/json' } });
  return client;
}

export function parseUri(uri: string) {
  uri = uri.replace('#', '%23');
  return uri;
}

export async function getMediaCount() {
  const mediaCount = await MediaLibrary.getAssetsAsync({
    mediaType: MediaLibrary.MediaType.audio,
    first: 0,
  });
  return mediaCount.totalCount;
}

export async function syncLocalMediaLibrary(
  tracksRepository: TracksRepository,
  artistsRepository: ArtistsRepository,
  albumsRepository: AlbumsRepository
) {
  try {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) return;
    const spotifyClient = await getSpotifyClient();
    const start = Date.now();
    let mediaCount = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 0,
    });
    store.dispatch(syncStart(mediaCount.totalCount));
    const mediaPageSize = 1000;
    const mediaPages = Math.ceil(mediaCount.totalCount / mediaPageSize);
    const artists = new Array<Artist>();
    const albums = new Array<Album>();
    const tracks = new Array<Track>();
    let endCursor: string | undefined;
    for (let index = 0; index < mediaPages; index++) {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: mediaPageSize,
        after: endCursor,
      });
      endCursor = media.endCursor;
      for (let index = 0; index < media.assets.length; index++) {
        const asset = media.assets[index];
        const track = await addLocalTrack(asset, artists, albums, spotifyClient);
        if (track) tracks.push(track);
        store.dispatch(syncIncrement());
      }
    }
    store.dispatch(syncSaving());
    await artistsRepository.createBulk(artists);
    await albumsRepository.createBulk(albums);
    await tracksRepository.createBulk(tracks);
    console.log(Math.floor(Date.now() - start));
    store.dispatch(syncComplete());
  } catch (error) {
    alert(error);
  } finally {
    store.dispatch(libraryRefreshed());
  }
}

export async function syncRemoteMediaLibrary(
  serverUrl: string,
  tracksRepository: TracksRepository,
  artistsRepository: ArtistsRepository,
  albumsRepository: AlbumsRepository
) {
  try {
    const start = Date.now();
    const spotifyClient = await getSpotifyClient();
    !serverUrl.endsWith('/') ? (serverUrl += '/') : null;
    const client = getServerClient(serverUrl);

    const validateServer = await client
      .get(`muziko/api/health`, { timeout: 20 })
      .then(() => true)
      .catch(() => false);
    if (!validateServer) {
      store.dispatch(syncFailed('Network Failure'));
      return;
    }
    const mediaCountResponse = await client.get<ApiResponse<Track[]>>(`muziko/api/tracks?offset=0&take=-1`);
    const mediaCount = mediaCountResponse.data._meta?.stats?.count ? mediaCountResponse.data._meta?.stats?.count : 0;
    store.dispatch(syncStart(mediaCount));
    const mediaPageSize = 1000;
    const mediaPages = Math.ceil(mediaCount / mediaPageSize);
    const artists = new Array<Artist>();
    const albums = new Array<Album>();
    const tracks = new Array<Track>();
    let offset = 0;
    for (let index = 0; index < mediaPages; index++) {
      const remoteTracksResponse = await client.get<ApiResponse<Track[]>>(
        `muziko/api/tracks?offset=${offset}&take=${mediaPageSize}`
      );
      const remoteTracks = remoteTracksResponse.data.data ? remoteTracksResponse.data.data : new Array<Track>();
      offset += remoteTracks.length;
      for (let index = 0; index < remoteTracks.length; index++) {
        let track = remoteTracks[index];
        if (track.title) {
          track = await addRemoteTrack(serverUrl, track, artists, albums, spotifyClient);
          tracks.push(track);
          store.dispatch(syncIncrement());
        }
      }
    }
    store.dispatch(syncSaving());
    await artistsRepository.createBulk(artists);
    await albumsRepository.createBulk(albums);
    await tracksRepository.createBulk(tracks);
    console.log(Math.floor(Date.now() - start));
    store.dispatch(syncComplete());
  } catch (error) {
    alert(error);
  } finally {
    setTimeout(() => {
      store.dispatch(libraryRefreshed());
    }, 1000);
  }
}

async function addLocalTrack(
  asset: MediaLibrary.Asset,
  artists: Array<Artist>,
  albums: Array<Album>,
  spotifyClient: SpotifyWebApi.SpotifyWebApiJs
) {
  try {
    asset.uri = parseUri(asset.uri);
    const info = await getTagInfo(asset.uri);
    if (info && info.common.title && info.common.artist) {
      const track: Track = {
        id: uuidv4(),
        libraryId: asset.id,
        trackNo: info.common.track.no ? info.common.track.no : undefined,
        diskNo: info.common.disk.no ? info.common.disk.no : undefined,
        year: info.common.year ? info.common.year : undefined,
        title: info.common.title,
        artist: info.common.artist,
        albumArtist: info.common.albumartist,
        album: info.common.album,
        date: info.common.date ? info.common.date : info.common.year?.toString(),
        duration: asset.duration,
        creationTime: asset.creationTime,
        modificationTime: asset.modificationTime,
        filename: asset.filename,
        url: asset.uri,
        isRemote: false,
      };
      const artist = await addArtist(track, artists, spotifyClient);
      track.artistRelation = artist;
      const album = await addAlbum(track, albums, artist);
      track.albumRelation = album;
      track.artwork = album?.artwork;
      return track;
    }
  } catch (error) {
    console.log(error);
  }
}

async function addRemoteTrack(
  serverUrl: string,
  track: Track,
  artists: Array<Artist>,
  albums: Array<Album>,
  spotifyClient: SpotifyWebApi.SpotifyWebApiJs
) {
  try {
    track.isRemote = true;
    track.url = `${serverUrl}muziko/api/tracks/${track.id}/stream`;
    const artist = await addArtist(track, artists, spotifyClient);
    track.artistRelation = artist;
    const album = await addAlbum(track, albums, artist, serverUrl);
    track.albumRelation = album;
    track.artwork = album?.artwork;
  } catch (error) {
    console.log(error);
  } finally {
    return track;
  }
}

async function addArtist(track: Track, artists: Array<Artist>, spotifyClient: SpotifyWebApi.SpotifyWebApiJs) {
  if (!track.artist) return;
  let artist = artists.find(p => p.name === track.artist);
  if (!artist) {
    artist = { id: uuidv4(), name: track.artist };
    artists.push(artist);
  }
  track.artistRelation = artist;
  if (artist.artwork) return artist;
  await getSpotifyArtistImage(artist, track, spotifyClient);
  return artist;
}

async function addAlbum(track: Track, albums: Array<Album>, artist?: Artist, serverUrl?: string) {
  if (!track.album) return;
  let album = albums.find(p => p.name === track.album);
  if (!album) {
    album = { id: uuidv4(), name: track.album, tracks: new Array<Track>() };
    albums.push(album);
  }
  track.albumRelation = album;
  if (!album.artistRelation && artist) album.artistRelation = artist;
  if (album.artwork) return album;
  track.isRemote && serverUrl
    ? await getRemoteCoverImage(serverUrl, album, track)
    : await getLocalCoverImage(album, track);
  return album;
}

export function getAudioMimeType(uri: string) {
  if (uri.endsWith('.flac')) {
    return 'audio/flac';
  }
  if (uri.endsWith('.ogg')) {
    return 'audio/ogg';
  }
  if (uri.endsWith('.aac')) {
    return 'audio/aac';
  }
  if (uri.endsWith('.mp4')) {
    return 'audio/mp4';
  }
  return 'audio/mpeg';
}
