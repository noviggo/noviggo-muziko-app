import { sort } from 'fast-sort';
import { Connection, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Artist } from '../entities/mediaEntities';

export class ArtistsRepository {
  private ormRepository: Repository<Artist>;

  constructor(connection: Connection) {
    this.ormRepository = connection.getRepository(Artist);
  }

  public async getAll(): Promise<Artist[]> {
    let artists = await this.ormRepository.find();
    artists = sort(artists).asc([p => p.name.replace('The ', '').replace('A ', '')]);
    return artists;
  }

  public async deleteAll() {
    await this.ormRepository.createQueryBuilder().delete().from(Artist).execute();
  }

  public async createBulk(artists: Artist[]): Promise<Artist[]> {
    if (artists.length === 0) return artists;
    await this.ormRepository.save(artists, { chunk: 300 });
    return artists;
  }

  public async createOrGet(artistName: string): Promise<Artist> {
    let artist = await this.ormRepository.findOne({ where: { name: artistName } });
    if (artist?.id) return artist;
    artist = this.ormRepository.create({
      id: uuidv4(),
      name: artistName,
    });
    await this.ormRepository.save(artist);
    return artist;
  }

  public async update(artist: Artist): Promise<Artist> {
    await this.ormRepository.save(artist);
    return artist;
  }

  public async get(id: string): Promise<Artist | undefined> {
    return await this.ormRepository.findOne(id, {
      relations: ['albums'],
    });
  }

  public async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
