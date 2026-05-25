import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User.js";
import { Music } from "./Music.js";

@Entity("albums")
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

  @Column({ name: "userId", type: "int" })
  userId;

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
