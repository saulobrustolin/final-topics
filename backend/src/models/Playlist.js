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
import { PlaylistMusic } from "./PlaylistMusic.js";

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
    type: "text",
    nullable: true
  })
  description;

  @Column({
    type: "text",
    nullable: true,
  })
  coverUrl;

  @Column({ type: "boolean", nullable: false, default: false })
  isPrivate;

  @Column({ name: "userId", type: "int" })
  userId;

  @ManyToOne(() => User, (user) => user.playlists, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn({
    name: "userId",
  })
  user;

  @OneToMany(() => PlaylistMusic, (playlistMusic) => playlistMusic.playlist)
  musics;

  @CreateDateColumn({ type: "timestamp" })
  createdAt;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt;
}

export { Playlist };
