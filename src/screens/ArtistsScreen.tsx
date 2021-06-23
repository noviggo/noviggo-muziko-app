import { faUserMusic } from '@fortawesome/pro-duotone-svg-icons';
import { faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ColorSchemeName, FlatList, ListRenderItem, Text, useColorScheme, View } from 'react-native';
import { Avatar, FAB, ListItem, SearchBar } from 'react-native-elements';

import Colors from '../constants/Colors';
import { useDatabaseConnection } from '../data/connection';
import { Artist } from '../data/entities/mediaEntities';
import { useAppSelector } from '../hooks/useRedux';
import { getLibraryRefreshed } from '../slices/libraryRefreshSlice';
import { getColor, getListScreenStyles } from '../utilities';

export default function ArtistsScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const styles = getListScreenStyles(colorScheme);
  const { artistsRepository } = useDatabaseConnection();
  const libraryRefreshed = useAppSelector(getLibraryRefreshed);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [search, setSearch] = useState<string>('');
  let flatListRef: FlatList<Artist> | null;
  const loadArtists = useCallback(async () => {
    const artists = await artistsRepository.getAll();
    setArtists(artists);
    setFilteredArtists(artists);
  }, [artistsRepository, libraryRefreshed]);

  useEffect(() => {
    loadArtists();
    return () => {};
  }, [loadArtists]);

  const navigateToArtist = (artist: Artist) => {
    navigation.navigate('ArtistAlbumsScreen', {
      artistId: artist.id,
    });
  };

  const filterArtists = async (value: string) => {
    setSearch(value);
    value
      ? setFilteredArtists(artists.filter(p => p.name.toLowerCase().includes(value.toLowerCase())))
      : setFilteredArtists(artists);
  };

  const renderItem: ListRenderItem<Artist> = ({ item }) => (
    <ListItem
      onPress={() => navigateToArtist(item)}
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
          renderPlaceholderContent={
            <FontAwesomeIcon size={50} icon={faUserMusic} color={getColor(colorScheme, 'icon')} />
          }
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
    <View style={[styles.container, { paddingTop: 5 }]}>
      <FlatList
        ref={list => (flatListRef = list)}
        data={filteredArtists}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={<Header colorScheme={colorScheme} search={search} filterArtists={filterArtists} />}
      />

      <FAB
        style={{ position: 'absolute', bottom: 10, right: 10, opacity: 0.8 }}
        size={'small'}
        onPress={() => {
          flatListRef?.scrollToOffset({ animated: true, offset: 0 });
        }}
        icon={<FontAwesomeIcon size={18} icon={faChevronUp} color={Colors.dark.icon} />}
      />
    </View>
  );
}

interface HeaderProps {
  colorScheme: ColorSchemeName;
  search: string;
  filterArtists: (a: string) => void;
}

function Header({ search, filterArtists }: HeaderProps) {
  const colorScheme = useColorScheme();
  return (
    <SearchBar
      lightTheme={colorScheme === 'light'}
      containerStyle={{
        borderTopWidth: 0,
        borderBottomWidth: 0,
        paddingVertical: 5,
        paddingHorizontal: 5,
        backgroundColor: getColor(colorScheme, 'background'),
      }}
      inputContainerStyle={{ borderRadius: 10 }}
      /*
      // @ts-ignore */
      onChangeText={text => filterArtists(text)}
      autoCapitalize={'none'}
      style={{
        color: getColor(colorScheme, 'text'),
      }}
      value={search}
    />
  );
}
