import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
} from "typeorm";
import { Album } from "./Album.js";
import { Music } from "./Music.js";
import { Playlist } from "./Playlist.js";

import UserRole from "./enums/UserRole.js";

@Entity("users")
class User {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "varchar",
    nullable: false,
  })
  name;

  @Column({
    type: "varchar",
    nullable: false,
    unique: true,
  })
  email;

  @Column({
    type: "text",
    nullable: false
  })
  password;

  @Column({
    type: "text",
    nullable: true
  })
  bio;

  @Column({
    type: "boolean",
    default: true
  })
  is_active;

  @Column({
    type: "enum",
    enum: Object.values(UserRole),
    default: UserRole.LISTENER
  })
  role;

  @ManyToMany(() => Music, (music) => music.artists, {
    cascade: false,
  })
  @JoinTable({
    name: "artist_music",
    joinColumn: {
      name: "artistId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "musicId",
      referencedColumnName: "id",
    },
  })
  musics;

  @OneToMany(() => Playlist, (playlist) => playlist.user)
  playlists;

  @OneToMany(() => Album, (album) => album.user)
  albums;

  @ManyToMany(() => Playlist, { cascade: false })
  @JoinTable({
    name: "user_followed_playlists",
    joinColumn: {
      name: "userId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "playlistId",
      referencedColumnName: "id",
    },
  })
  followedPlaylists;

  @CreateDateColumn({ type: "timestamp" })
  created_at;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at;
}

export { User };
