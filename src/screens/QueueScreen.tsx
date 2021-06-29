import { faTimesCircle, faTrash } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Text, useColorScheme, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { Button, ListItem } from 'react-native-elements';
import { State } from 'react-native-track-player';

import Colors from '../constants/Colors';
import { useDatabaseConnection } from '../data/connection';
import { Queued } from '../data/entities/mediaEntities';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { skip } from '../services/playerService';
import { getLibraryRefreshed } from '../slices/libraryRefreshSlice';
import { getNowPlaying } from '../slices/nowPlayingSlice';
import { getPlayerState } from '../slices/playerStateSlice';
import { getQueueState } from '../slices/queueStateSlice';
import { formatDuration, getColor, getListScreenStyles } from '../utilities';

export default function PlayQueueScreen() {
  const [duration, setDuration] = useState('');
  const { queueRepository } = useDatabaseConnection();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const styles = getListScreenStyles(colorScheme);
  const nowPlaying = useAppSelector(getNowPlaying);
  const playerState = useAppSelector(getPlayerState);
  const libraryRefreshed = useAppSelector(getLibraryRefreshed);
  const queueLastUpdated = useAppSelector(getQueueState);
  const [queue, setQueue] = useState<Queued[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadQueue = async () => {
      let duration = 0;
      const queue = await queueRepository.getAll();
      setQueue(queue);
      queue.forEach(track => {
        duration += track.duration;
      });
      setDuration(formatDuration(duration));
      setIsLoaded(true);
    };
    loadQueue();
    return () => {};
  }, [queueLastUpdated, libraryRefreshed]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          containerStyle={{ borderRadius: 50 }}
          onPress={() => queueRepository.clear()}
          type="clear"
          icon={<FontAwesomeIcon size={18} color={Colors.dark.text} icon={faTrash} />}
        />
      ),
    });
  }, [navigation]);

  const reorder = async (orderedQueue: Queued[]) => {
    setQueue(orderedQueue);
    await queueRepository.reorder(orderedQueue);
  };

  const dragAction = async (drag: () => void) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    drag();
  };

  const renderItem = useCallback(
    ({ item, drag }: RenderItemParams<Queued>) => {
      return (
        <ListItem
          onPress={() => skip(item)}
          onLongPress={() => dragAction(drag)}
          containerStyle={[styles.listItemContainer, { padding: 15 }]}
          underlayColor={getColor(colorScheme, 'background')}
        >
          {item.id === nowPlaying?.id ? (
            <LottieView
              source={require('../animations/4080-sound-bars-animation.json')}
              autoPlay={true}
              loop={true}
              speed={playerState === State.Playing ? 1 : 0}
              style={{ width: 25 }}
            />
          ) : (
            <Text style={{ width: 25, textAlign: 'center', color: getColor(colorScheme, 'textMuted') }}>
              {item.order + 1}
            </Text>
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
                  onPress={() => queueRepository.remove(item.order)}
                  type="clear"
                  containerStyle={styles.listItemButton}
                  icon={<FontAwesomeIcon icon={faTimesCircle} size={14} color={getColor(colorScheme, 'icon')} />}
                />
              </View>
            </View>
          </ListItem.Content>
        </ListItem>
      );
    },
    [nowPlaying, playerState]
  );

  function Header() {
    return <View style={styles.header}></View>;
  }

  return (
    <View style={styles.container}>
      <DraggableFlatList
        ListHeaderComponent={<Header />}
        style={styles.list}
        data={queue}
        renderItem={renderItem}
        keyExtractor={item => item?.id}
        onDragEnd={async ({ data }) => await reorder(data)}
      />
      {isLoaded && queue.length === 0 ? <EmptyQueue /> : null}
    </View>
  );
}

function EmptyQueue() {
  const colorScheme = useColorScheme();
  return (
    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center' }}>
      <LottieView
        source={require('../animations/45661-sleep-panda.json')}
        autoPlay={true}
        loop={true}
        style={{ width: '80%' }}
      />
      <Text style={{ color: getColor(colorScheme, 'textMuted'), fontSize: 24, marginTop: -40 }}>Queue Empty</Text>
    </View>
  );
}
