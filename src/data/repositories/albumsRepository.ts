import { sort } from 'fast-sort';
import { Connection, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Album } from '../entities/mediaEntities';

export class AlbumsRepository {
  private ormRepository: Repository<Album>;

  constructor(connection: Connection) {
    this.ormRepository = connection.getRepository(Album);
  }

  public async get(id: string): Promise<Album | undefined> {
    return await this.ormRepository.findOne(id, {
      relations: ['artistRelation', 'tracks'],
    });
  }

  public async getAll(): Promise<Album[]> {
    let albums = await this.ormRepository.find();
    albums = sort(albums).asc([p => p.name]);
    return albums;
  }

  public async createOrGet(albumName: string): Promise<Album> {
    let album = await this.ormRepository.findOne({ where: { name: albumName } });
    if (album) return album;
    album = this.ormRepository.create({
      id: uuidv4(),
      name: albumName,
    });
    await this.ormRepository.save(album);
    return album;
  }

  public async update(album: Album): Promise<Album> {
    await this.ormRepository.save(album);
    return album;
  }

  public async deleteAll() {
    await this.ormRepository.createQueryBuilder().delete().from(Album).execute();
  }

  public async createBulk(albums: Album[]): Promise<Album[]> {
    if (albums.length === 0) return albums;
    const mediaPageSize = 40;
    const mediaPages = Math.ceil(albums.length / mediaPageSize);
    let offset = 0;
    for (let index = 0; index < mediaPages; index++) {
      const pagedAlbums = albums.slice(offset, offset + mediaPageSize);
      offset += pagedAlbums.length;
      await this.ormRepository.insert(pagedAlbums);
    }
    return albums;
  }

  public async delete(id: number): Promise<void> {
    await this.ormRepository.delete(id);
  }

  public async deleteBulk(albums: Album[]): Promise<void> {
    await this.ormRepository.remove(albums, { chunk: 500 });
  }
}
