import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User.js";
import { Review } from "./Music.js";
import { BuySell } from "./Playlist.js";

@Entity("albuns")
class Album {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "varchar",
    nullable: false,
  })
  title;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  releaseDate;

  @Column({
    type: "text",
    nullable: true,
  })
  coverUrl;

  @ManyToOne(() => User, (user) => user.albums, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn({
    name: "userId",
  })
  user;

  @OneToMany(() => Music, (music) => music.album)
  musics;
}

export { Album };