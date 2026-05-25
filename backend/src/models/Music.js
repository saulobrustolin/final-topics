import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Album } from "./Album.js";
import { User } from "./User.js";
import { PlaylistMusic } from "./PlaylistMusic.js";

@Entity("musics")
class Music {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "varchar",
    nullable: false,
  })
  title;

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
    nullable: true,
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

  @ManyToOne(() => User, {
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn({
    name: "ownerId",
  })
  owner;

  @Column({ name: "ownerId", type: "int", nullable: false })
  ownerId;

  @OneToMany(() => PlaylistMusic, (playlistMusic) => playlistMusic.music)
  playlistMusics;

  @CreateDateColumn({ type: "timestamp" })
  createdAt;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt;
}

export { Music };
