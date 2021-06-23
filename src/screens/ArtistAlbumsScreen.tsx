import { faAlbum, faAlbumCollection, faMusicAlt, faPlusCircle, faUserMusic } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { sort } from 'fast-sort';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { useEffect } from 'react';
import { FlatList, ListRenderItem, useColorScheme, View, Text } from 'react-native';
import { Avatar, Button, ListItem } from 'react-native-elements';
import Toast from 'react-native-simple-toast';

import { useDatabaseConnection } from '../data/connection';
import { Album, Artist } from '../data/entities/mediaEntities';
import { NavParamList } from '../types';
import { getColor, getListScreenStyles } from '../utilities';

export default function ArtistAlbumsScreen() {
  const [artist, setArtist] = useState<Artist>();
  const [albums, setAlbums] = useState(new Array<Album>());
  const [songCount, setSongCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const route = useRoute<RouteProp<NavParamList, 'ArtistAlbumsScreen'>>();
  const { artistsRepository, tracksRepository, queueRepository, albumsRepository } = useDatabaseConnection();
  const { artistId } = route.params;
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const styles = getListScreenStyles(colorScheme);

  const loadAlbums = useCallback(async () => {
    let duration = 0;
    const artist = await artistsRepository.get(artistId);
    if (artist) {
      setArtist(artist);
      if (artist.albums) {
        setAlbums(sort(artist.albums).asc(p => p.name));
        setSongCount(await tracksRepository.getArtistSongCount(artist));
      }
      navigation.setOptions({ headerTitle: artist?.name });
      setIsLoading(false);
    }
  }, [artistsRepository, tracksRepository, artistId, navigation]);

  useEffect(() => {
    loadAlbums();
    return () => {};
  }, [loadAlbums]);

  const navigateToAlbum = (album: Album) => {
    navigation.navigate('AlbumTracksScreen', {
      albumId: album.id,
    });
  };

  const addToQueue = async (album: Album) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const albumTracks = await albumsRepository.get(album.id);
    if (!albumTracks?.tracks) return;
    queueRepository.addToEnd(sort(albumTracks.tracks).asc([p => p.trackNo]));
    Toast.show(`${albumTracks.tracks.length} songs added`);
  };

  const playAlbum = async (album: Album) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const albumTracks = await albumsRepository.get(album.id);
    if (!albumTracks?.tracks) return;
    queueRepository.play(sort(albumTracks.tracks).asc([p => p.trackNo]));
    Toast.show(`Now Playing ${album.name}`);
  };

  const renderItem: ListRenderItem<Album> = ({ item }) => (
    <ListItem
      onPress={() => navigateToAlbum(item)}
      onLongPress={() => playAlbum(item)}
      containerStyle={styles.listItemContainer}
      underlayColor={getColor(colorScheme, 'background')}
    >
      {item?.artwork ? (
        <Avatar
          size="large"
          avatarStyle={{ borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }}
          placeholderStyle={{ backgroundColor: 'transparent' }}
          source={{ uri: item?.artwork }}
        />
      ) : (
        <Avatar
          size="large"
          placeholderStyle={{ backgroundColor: 'transparent' }}
          renderPlaceholderContent={<FontAwesomeIcon size={50} icon={faAlbum} color={getColor(colorScheme, 'icon')} />}
        />
      )}
      <ListItem.Content>
        <View style={styles.listContents}>
          <View style={styles.listContentsLeft}>
            <Text style={styles.listTitle}>{item.name}</Text>
          </View>
          <View style={styles.listContentsRight}>
            <Button
              onPress={() => addToQueue(item)}
              type="clear"
              containerStyle={[styles.listItemButton, { marginRight: 15 }]}
              icon={<FontAwesomeIcon icon={faPlusCircle} size={14} color={getColor(colorScheme, 'icon')} />}
            />
          </View>
        </View>
      </ListItem.Content>
    </ListItem>
  );

  function Header() {
    return (
      <View style={styles.header}>
        <View style={styles.headerImage}>
          {artist?.artwork ? (
            <Avatar
              avatarStyle={{
                borderBottomLeftRadius: 10,
                borderTopLeftRadius: 10,
              }}
              size="xlarge"
              placeholderStyle={styles.placeholder}
              source={{
                uri: artist?.artwork,
              }}
            />
          ) : (
            <Avatar
              avatarStyle={{
                borderBottomLeftRadius: 10,
                borderTopLeftRadius: 10,
              }}
              size="xlarge"
              placeholderStyle={styles.placeholder}
              renderPlaceholderContent={
                <FontAwesomeIcon size={50} icon={faUserMusic} color={getColor(colorScheme, 'icon')} />
              }
            />
          )}
        </View>
        <View style={styles.headerContents}>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {artist?.name}
          </Text>
          <View style={styles.headerDetailGroup}>
            <FontAwesomeIcon
              style={{ marginRight: 5 }}
              icon={faAlbumCollection}
              size={12}
              color={getColor(colorScheme, 'textMuted')}
            />
            <Text style={styles.headerDetails} numberOfLines={1}>
              {artist?.albums?.length}
              {artist?.albums?.length === 1 ? ' album' : ' albums'}
            </Text>
          </View>

          <View style={styles.headerDetailGroup}>
            <FontAwesomeIcon
              style={{ marginRight: 5 }}
              icon={faMusicAlt}
              size={12}
              color={getColor(colorScheme, 'textMuted')}
            />
            <Text style={styles.headerDetails}>{songCount} songs</Text>
          </View>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList data={albums} renderItem={renderItem} ListHeaderComponent={<Header />} keyExtractor={item => item.id} />
    </View>
  );
}
