import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  Unique,
} from "typeorm";
import { Playlist } from "./Playlist.js";
import { Music } from "./Music.js";

@Entity("playlist_musics")
@Unique(["playlist", "music"])
class PlaylistMusic {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: "integer", default: 0 })
  position;

  @CreateDateColumn({ type: "timestamp" })
  addedAt;

  @ManyToOne(() => Playlist, (playlist) => playlist.musics, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false
  })
  playlist;

  @ManyToOne(() => Music, (music) => music.playlistMusics, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false
  })
  music;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt;
}

export { PlaylistMusic };
