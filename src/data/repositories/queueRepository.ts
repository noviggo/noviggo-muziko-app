import { sort } from 'fast-sort';
import TrackPlayer, { State } from 'react-native-track-player';
import { Connection, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { clearNowPlaying } from '../../services/playerService';
import { queueUpdated } from '../../slices/queueStateSlice';
import { store } from '../../store';
import { Queued, Track } from '../entities/mediaEntities';

export class QueueRepository {
  private ormRepository: Repository<Queued>;

  constructor(connection: Connection) {
    this.ormRepository = connection.getRepository(Queued);
  }

  public async getAll(): Promise<Queued[]> {
    let queue = await this.ormRepository.find();
    queue = sort(queue).asc([p => p.order]);
    return queue;
  }

  public async clear() {
    await this.ormRepository.createQueryBuilder().delete().from(Queued).execute();
    await clearNowPlaying();
    store.dispatch(queueUpdated());
  }

  public async addToEnd(tracks: Track[]): Promise<Queued[]> {
    const existingQueue = (await TrackPlayer.getQueue()) as Queued[];
    const last = existingQueue.length > 0 ? existingQueue.length : 0;
    const addedQueue = new Array<Queued>();
    for (let index = 0; index < tracks.length; index++) {
      const track = tracks[index];
      const queued = this.ormRepository.create(this.mapToQueued(track, last + index));
      addedQueue.push(queued);
    }
    await this.ormRepository.save(addedQueue);
    await TrackPlayer.add(addedQueue);
    store.dispatch(queueUpdated());
    return (await TrackPlayer.getQueue()) as Queued[];
  }

  public async play(tracks: Track[], queuedTrack?: Track): Promise<Queued[]> {
    await this.clear();
    const queue = new Array<Queued>();
    for (let index = 0; index < tracks.length; index++) {
      const track = tracks[index];
      const queued = this.ormRepository.create(this.mapToQueued(track, index));
      queue.push(queued);
    }
    await this.ormRepository.save(queue);
    const queued = queuedTrack ? queue.find(p => p.track?.id === queuedTrack.id) : undefined;
    await TrackPlayer.add(queue);
    if (!queued) return queue;
    await TrackPlayer.skip(queued.order);
    TrackPlayer.play();
    store.dispatch(queueUpdated());
    return queue;
  }

  public async remove(index: number): Promise<void> {
    if (index < 0) return;
    const nowPlayingIndex = await TrackPlayer.getCurrentTrack();
    let queue = (await TrackPlayer.getQueue()) as Queued[];
    if (nowPlayingIndex === index && queue.length === 1) {
      await TrackPlayer.reset();
      await this.clear();
      return;
    } else if (nowPlayingIndex === index && index < queue.length - 1) {
      TrackPlayer.skipToNext();
    } else if (nowPlayingIndex === index && index > 0) {
      TrackPlayer.skipToPrevious();
    }
    await TrackPlayer.remove(index);
    queue = (await TrackPlayer.getQueue()) as Queued[];
    for (let index = 0; index < queue.length; index++) {
      const currentQueued = queue[index];
      currentQueued.order = index;
    }
    await this.ormRepository.clear();
    await this.ormRepository.save(queue);
    store.dispatch(queueUpdated());
  }

  public async reorder(orderedQueue: Queued[]) {
    const queue = (await TrackPlayer.getQueue()) as Queued[];
    const nowPlayingIndex = await TrackPlayer.getCurrentTrack();
    const nowPlaying = queue[nowPlayingIndex];
    const newNowPlayingIndex = orderedQueue.findIndex(p => p.id === nowPlaying.id);
    const currentPosition = await TrackPlayer.getPosition();
    const playerState = await TrackPlayer.getState();
    for (let index = 0; index < orderedQueue.length; index++) {
      const queued = orderedQueue[index];
      queued.order = index;
    }
    await this.ormRepository.save(orderedQueue);
    store.dispatch(queueUpdated());
    TrackPlayer.reset().then(async () => {
      await TrackPlayer.add(orderedQueue);
      await TrackPlayer.skip(newNowPlayingIndex);
      await TrackPlayer.seekTo(currentPosition);
      if (playerState === State.Playing) TrackPlayer.play();
    });
  }

  public mapToQueued(track: Track, order: number): Queued {
    return {
      id: uuidv4(),
      order: order,
      url: track.url,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
      album: track.album,
      genre: track.genre,
      date: track.date,
      artwork: track.artwork,
      track: track,
    };
  }
}
