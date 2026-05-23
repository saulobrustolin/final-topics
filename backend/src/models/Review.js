import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./User.js";
import { Game } from "./Game.js";

@Entity("reviews")
@Unique(["userId", "gameId"])
class Review {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "int",
    nullable: false,
  })
  userId;

  @Column({
    type: "int",
    nullable: false,
  })
  gameId;

  @Column({
    type: "int",
    nullable: false,
  })
  rating;

  @Column({
    type: "text",
    nullable: false,
  })
  comment;

  @ManyToOne(() => User, (user) => user.reviews, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn({
    name: "userId",
  })
  user;

  @ManyToOne(() => Game, (game) => game.reviews, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn({
    name: "gameId",
  })
  game;
}

export { Review };