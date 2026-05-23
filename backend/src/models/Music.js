import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./User.js";
import { Game } from "./Album.js";

@Entity("musics")
@Unique(["userId", "musicId"])
class Music {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "int",
    nullable: false,
  })
  duration;

  @Column({
    type: "text",
    nullable: false,
  })
  audioUrl;

  @Column({
    type: "text",
    nullable: false,
  })
  coverUrl;

  @ManyToOne(() => Album, (album) => album.musics, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn({
    name: "albumId",
  })
  album;

  @ManyToMany(() => User, (user) => user.musics)
  artists;

  @ManyToMany(() => PaylistMusic, (playlistMusic) => playlistMusic.paylist)
  paylists;

  @CreateDateColumn({ type: "timestamp" })
  createdAt;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt;
}

export { Music };