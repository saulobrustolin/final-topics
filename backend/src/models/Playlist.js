import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./User.js";
import { Game } from "./Album.js";
import { PaylistMusic } from "./PlaylistMusic.js";

@Entity("playlists")
class Playlist {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "varchar",
    nullable: false,
  })
  title;

  @Column({
    type: "text"
  })
  description;

  @Column({
    type: "text",
    nullable: false,
  })
  coverUrl;

  @Column({
    type: "boolean",
    nullable: false,
    default: false
  })
  isPrivate;

  @ManyToOne(() => User, (user) => user.paylists, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn({
    name: "userId",
  })
  user;

  @OneToMany(() => PaylistMusic, (playlistMusic) => playlistMusic.playlist)
  musics;

  @CreateDateColumn({ type: "timestamp" })
  createdAt;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt;
}

export { Playlist };
