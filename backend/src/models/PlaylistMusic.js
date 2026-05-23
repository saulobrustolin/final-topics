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
@Unique(["paylist", "music"])
class PlaylistMusic {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: "integer" })
  position;

  @CreateDateColumn({ type: "timestamp" })
  addedAt;

  @ManyToOne(() => Playlist, (playlist) => playlist.musics)
  playlist;

  @ManyToOne(() => Music, (music) => music.paylists)
  music;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt;
}

export { PlaylistMusic };