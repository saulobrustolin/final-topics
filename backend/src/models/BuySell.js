import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User.js";
import { Game } from "./Game.js";

@Entity("buy_sells")
class BuySell {
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
    type: "date",
    nullable: false,
  })
  date;

  @Column({
    type: "int",
    nullable: false,
  })
  finalPrice;

  @Column({
    type: "varchar",
    nullable: false,
  })
  status;

  @ManyToOne(() => User, (user) => user.buySells, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn({
    name: "userId",
  })
  user;

  @ManyToOne(() => Game, (game) => game.buySells, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn({
    name: "gameId",
  })
  game;
}

export { BuySell };
