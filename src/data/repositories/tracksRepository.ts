import { sort } from 'fast-sort';
import { Connection, Repository } from 'typeorm';

import { Artist, Track } from '../entities/mediaEntities';

export class TracksRepository {
  private ormRepository: Repository<Track>;

  constructor(connection: Connection) {
    this.ormRepository = connection.getRepository(Track);
  }

  public async get(id: string): Promise<Track | undefined> {
    return await this.ormRepository.findOne(id);
  }

  public async getArtistSongCount(artist: Artist): Promise<number> {
    const count = await this.ormRepository.count({ where: { artistRelation: { id: artist.id } } });
    return count;
  }

  public async getAll(): Promise<Track[]> {
    let tracks = await this.ormRepository.find();
    tracks = sort(tracks).asc([p => p.artist, p => p.album, p => p.trackNo]);
    return tracks;
  }

  public async deleteAll() {
    await this.ormRepository.createQueryBuilder().delete().from(Track).execute();
  }

  public async createOrGet(track: Track): Promise<Track> {
    const existingTrack = track.isRemote
      ? await this.ormRepository.findOne({ where: { id: track.id } })
      : await this.ormRepository.findOne({ where: { libraryId: track.libraryId } });
    if (!existingTrack) {
      track = this.ormRepository.create(track);
      await this.ormRepository.save(track);
    } else {
      track = existingTrack;
    }
    return track;
  }

  public async create(track: Track): Promise<Track> {
    track = this.ormRepository.create(track);
    await this.ormRepository.save(track);
    return track;
  }

  public async createBulk(tracks: Track[]): Promise<Track[]> {
    if (tracks.length === 0) return tracks;
    const mediaPageSize = 40;
    const mediaPages = Math.ceil(tracks.length / mediaPageSize);
    let offset = 0;
    for (let index = 0; index < mediaPages; index++) {
      const pagedTracks = tracks.slice(offset, offset + mediaPageSize);
      offset += pagedTracks.length;
      await this.ormRepository.insert(pagedTracks);
    }
    return tracks;
  }

  public async delete(id: number): Promise<void> {
    await this.ormRepository.delete(id);
  }

  public async deleteBulk(tracks: Track[]): Promise<void> {
    await this.ormRepository.remove(tracks, { chunk: 500 });
  }
}
