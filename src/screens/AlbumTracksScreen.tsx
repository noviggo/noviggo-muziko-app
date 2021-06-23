import { faAlbum, faMusicAlt, faPlusCircle, faStopwatch, faUserMusic } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { sort } from 'fast-sort';
import LottieView from 'lottie-react-native';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, ListRenderItem, Text, useColorScheme, View } from 'react-native';
import { Avatar, Button, ListItem } from 'react-native-elements';
import Toast from 'react-native-toast-message';
import { State } from 'react-native-track-player';

import { useDatabaseConnection } from '../data/connection';
import { Album, Track } from '../data/entities/mediaEntities';
import { useAppSelector } from '../hooks/useRedux';
import { getNowPlaying } from '../slices/nowPlayingSlice';
import { getPlayerState } from '../slices/playerStateSlice';
import { NavParamList } from '../types';
import { formatDuration, getColor, getListScreenStyles } from '../utilities';

export default function AlbumTracksScreen() {
  const [album, setAlbum] = useState<Album>();
  const [tracks, setTracks] = useState(new Array<Track>());
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const route = useRoute<RouteProp<NavParamList, 'AlbumTracksScreen'>>();
  const { albumsRepository, queueRepository } = useDatabaseConnection();
  const { albumId } = route.params;
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const styles = getListScreenStyles(colorScheme);
  const nowPlaying = useAppSelector(getNowPlaying);
  const playerState = useAppSelector(getPlayerState);

  const loadTracks = useCallback(async () => {
    let duration = 0;
    const album = await albumsRepository.get(albumId);
    if (album) {
      setAlbum(album);
      setTracks(sort(album.tracks).asc(p => p.trackNo));
      album.tracks.forEach(track => {
        duration += track.duration;
      });
      setDuration(formatDuration(duration));
      navigation.setOptions({
        headerTitle: album?.name,
      });
      setIsLoading(false);
    }
  }, [albumsRepository, albumId, navigation]);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  const queueByAlbum = async () => {
    if (!album?.tracks) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await queueByTrack(tracks[0]);
  };

  const queueByTrack = async (queuedTrack: Track) => {
    if (!album?.tracks) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await queueRepository.play(tracks, queuedTrack);
  };

  const addToEnd = async (track: Track) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await queueRepository.addToEnd([track]);
    Toast.hide();
    Toast.show({
      type: 'info',
      text1: 'Queue Update',
      text2: `Added ${track.title}`,
      position: 'bottom',
      onPress: () => {
        navigation.navigate('QueueScreen');
        Toast.hide();
      },
    });
  };

  const renderItem: ListRenderItem<Track> = ({ item }) => (
    <ListItem
      onLongPress={() => queueByTrack(item)}
      containerStyle={[styles.listItemContainer, { padding: 15 }]}
      underlayColor={getColor(colorScheme, 'background')}
    >
      {item.id === nowPlaying?.track?.id ? (
        <LottieView
          source={require('../animations/4080-sound-bars-animation.json')}
          autoPlay={true}
          loop={true}
          speed={playerState === State.Playing ? 1 : 0}
          style={{ width: 25 }}
        />
      ) : (
        <Text style={{ width: 25, textAlign: 'center' }}>{item?.trackNo ? item?.trackNo : null}</Text>
      )}

      <ListItem.Content>
        <View style={styles.listContents}>
          <View style={styles.listContentsLeft}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <Text style={styles.listSubtitle}>{item.album}</Text>
          </View>
          <View style={styles.listContentsRight}>
            <Text style={styles.listItemDuration}>{formatDuration(item?.duration)}</Text>
            <Button
              onPress={() => addToEnd(item)}
              type="clear"
              containerStyle={styles.listItemButton}
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
          {album?.artwork ? (
            <Avatar
              avatarStyle={{
                borderBottomLeftRadius: 10,
                borderTopLeftRadius: 10,
              }}
              onLongPress={() => queueByAlbum()}
              size="xlarge"
              placeholderStyle={styles.placeholder}
              source={{
                uri: album?.artwork,
              }}
            />
          ) : (
            <Avatar
              onLongPress={() => queueByAlbum()}
              size="xlarge"
              avatarStyle={{
                borderBottomLeftRadius: 10,
                borderTopLeftRadius: 10,
              }}
              placeholderStyle={styles.placeholder}
              renderPlaceholderContent={
                <FontAwesomeIcon size={50} icon={faAlbum} color={getColor(colorScheme, 'icon')} />
              }
            />
          )}
        </View>
        <View style={styles.headerContents}>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {album?.name}
          </Text>
          <View style={styles.headerDetailGroup}>
            <FontAwesomeIcon
              style={{ marginRight: 5 }}
              icon={faUserMusic}
              size={12}
              color={getColor(colorScheme, 'textMuted')}
            />
            <Text style={styles.headerDetails} numberOfLines={1}>
              {album?.artistRelation?.name}
            </Text>
          </View>

          <View style={styles.headerDetailGroup}>
            <FontAwesomeIcon
              style={{ marginRight: 5 }}
              icon={faMusicAlt}
              size={12}
              color={getColor(colorScheme, 'textMuted')}
            />
            <Text style={styles.headerDetails}>{tracks?.length} songs</Text>
          </View>

          <View style={styles.headerDetailGroup}>
            <FontAwesomeIcon
              style={{ marginRight: 5 }}
              icon={faStopwatch}
              size={12}
              color={getColor(colorScheme, 'textMuted')}
            />
            <Text style={styles.headerDetails}>{duration}</Text>
          </View>
        </View>
      </View>
    );
  }

  if (isLoading) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={<Header />}
        style={styles.list}
        data={tracks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        extraData={[nowPlaying, playerState]}
      />
    </View>
  );
}
