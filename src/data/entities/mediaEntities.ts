import { Track as PlayerTrack } from 'react-native-track-player';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tracks')
export class Track {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  shortId?: string;

  @Column({ nullable: true })
  libraryId?: string;

  @Column({ nullable: true })
  trackNo?: number;

  @Column({ nullable: true })
  diskNo?: number;

  @Column({ nullable: true })
  year?: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  albumArtist?: string;

  @Column({ nullable: true })
  date?: string;

  @Column({ nullable: true })
  genre?: string;

  @Column()
  duration: number;

  @Column({ nullable: true })
  creationTime?: number;

  @Column({ nullable: true })
  modificationTime?: number;

  @Column({ nullable: true })
  lastWriteDate?: Date;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  rating?: number;

  @Column()
  artist: string;

  @Column({ nullable: true })
  album?: string;

  @Column({ nullable: true })
  artwork?: string;

  @Column()
  isRemote: boolean;

  @ManyToOne(() => Artist, artist => artist.tracks, { nullable: true }) artistRelation?: Artist;

  @ManyToOne(() => Album, album => album.tracks, { nullable: true }) albumRelation?: Album;
}

@Entity('artists')
export class Artist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  artwork?: string;

  @Column()
  noArtwork: boolean;

  @OneToMany(() => Album, albumRelation => albumRelation.artistRelation, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  albums?: Album[];

  @OneToMany(() => Track, trackRelation => trackRelation.artistRelation, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  tracks?: Track[];
}

@Entity('albums')
export class Album {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  artwork?: string;

  @Column()
  noArtwork: boolean;

  @OneToMany(() => Track, trackRelation => trackRelation.albumRelation, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  tracks: Track[];

  @ManyToOne(() => Artist, artistRelation => artistRelation.tracks, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  artistRelation?: Artist;
}

@Entity('queue')
export class Queued implements PlayerTrack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  order: number;

  @Column()
  url: string;

  @Column()
  title: string;

  @Column()
  artist: string;

  @Column()
  duration: number;

  @Column({ nullable: true })
  album?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  genre?: string;

  @Column({ nullable: true })
  date?: string;

  @Column({ nullable: true })
  artwork?: string;

  @ManyToOne(() => Track) track: Track;
}
