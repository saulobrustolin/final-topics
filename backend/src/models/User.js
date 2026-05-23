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
import { Game } from "./Album.js";
import { Review } from "./Music.js";
import { BuySell } from "./Playlist.js";

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
  })
  bio;

  @Column({
    type: "text"
  })
  profile_url;

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
      name: "musicId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "artistId",
      referencedColumnName: "id",
    },
  })
  musics;

  @OneToMany(() => Playlist, (playlist) => playlist.user)
  paylists;

  @OneToMany(() => Album, (album) => album.user)
  albuns;

  @CreateDateColumn({ type: "timestamp" })
  created_at;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at;
}

export { User };
