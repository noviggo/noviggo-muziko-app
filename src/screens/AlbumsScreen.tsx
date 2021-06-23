import { faAlbum } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, ListRenderItem, Text, useColorScheme, View } from 'react-native';
import { Avatar, ListItem } from 'react-native-elements';

import { useDatabaseConnection } from '../data/connection';
import { Album } from '../data/entities/mediaEntities';
import { useAppSelector } from '../hooks/useRedux';
import { getLibraryRefreshed } from '../slices/libraryRefreshSlice';
import { getColor, getListScreenStyles } from '../utilities';

export default function AlbumsScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const styles = getListScreenStyles(colorScheme);
  const { albumsRepository } = useDatabaseConnection();
  const libraryRefreshed = useAppSelector(getLibraryRefreshed);
  const [albums, setAlbums] = useState<Album[]>([]);
  const loadAlbums = useCallback(async () => {
    setAlbums(await albumsRepository.getAll());
  }, [albumsRepository, libraryRefreshed]);
  useEffect(() => {
    loadAlbums();
    return () => {};
  }, [loadAlbums]);

  const navigateToAlbum = (album: Album) => {
    navigation.navigate('AlbumTracksScreen', {
      albumId: album.id,
    });
  };

  const renderItem: ListRenderItem<Album> = ({ item }) => (
    <ListItem
      onPress={() => navigateToAlbum(item)}
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
        </View>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <View style={[styles.container, { paddingTop: 10 }]}>
      <FlatList data={albums} renderItem={renderItem} extraData={albums} keyExtractor={item => item.name} />
    </View>
  );
}
