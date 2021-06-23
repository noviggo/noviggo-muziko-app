import { sort } from 'fast-sort';
import TrackPlayer from 'react-native-track-player';
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

  /*   public async playNext(tracks: Track[]): Promise<Queued[]> {
      const nowPlaying = await TrackPlayer.getPosition();
      const existingQueue = await this.getAll();
      const nowPlayingIndex = existingQueue.length > 0 ? existingQueue[existingQueue.length]?.order : 0;
      const addedQueue = new Array<Queued>();
      tracks.forEach(track => {
        const queued = this.ormRepository.create(this.mapToQueued(track, nowPlayingIndex + 1));
        addedQueue.push(queued);
      });
      await this.ormRepository.save(addedQueue);
      await TrackPlayer.add(addedQueue);
      store.dispatch(queueUpdated());
      return await this.getAll();
    } */

  public async remove(index: number): Promise<void> {
    if (index < 0) return;
    await TrackPlayer.remove(index);
    const queue = (await TrackPlayer.getQueue()) as Queued[];
    for (let index = 0; index < queue.length; index++) {
      const currentQueued = queue[index];
      currentQueued.order = index;
    }
    await this.ormRepository.clear();
    await this.ormRepository.save(queue);
    store.dispatch(queueUpdated());
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
