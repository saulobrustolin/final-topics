import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
} from "typeorm";
import { Game } from "./Game.js";
import { Review } from "./Review.js";
import { BuySell } from "./BuySell.js";

@Entity("users")
class User {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "varchar",
    nullable: false,
  })
  name;

  @Column({
    type: "varchar",
    nullable: false,
    unique: true,
  })
  email;

  @ManyToMany(() => Game, (game) => game.users, {
    cascade: false,
  })
  @JoinTable({
    name: "user_games",
    joinColumn: {
      name: "userId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "gameId",
      referencedColumnName: "id",
    },
  })
  games;

  @OneToMany(() => Review, (review) => review.user)
  reviews;

  @OneToMany(() => BuySell, (buySell) => buySell.user)
  buySells;
}

export { User };
