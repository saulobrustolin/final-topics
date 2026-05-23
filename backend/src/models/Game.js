import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
} from "typeorm";
import { User } from "./User.js";
import { Review } from "./Review.js";
import { BuySell } from "./BuySell.js";

@Entity("games")
class Game {
  @PrimaryGeneratedColumn()
  id;

  @Column({
    type: "varchar",
    nullable: false,
  })
  title;

  @Column({
    type: "varchar",
    nullable: true,
  })
  genre;

  @Column({
    type: "int",
    nullable: true,
  })
  releaseYear;

  @Column({
    type: "varchar",
    nullable: true,
  })
  coverImage;

  @ManyToMany(() => User, (user) => user.games)
  users;

  @OneToMany(() => Review, (review) => review.game)
  reviews;

  @OneToMany(() => BuySell, (buySell) => buySell.game)
  buySells;
}

export { Game };