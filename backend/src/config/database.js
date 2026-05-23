import dotenv from "dotenv";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../models/User.js";
import { Game } from "../models/Game.js";
import { Review } from "../models/Review.js";
import { BuySell } from "../models/BuySell.js";

dotenv.config();

const databaseConfig = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5433,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "aula",
  synchronize: process.env.DB_SYNCHRONIZE === "true" || true,
  logging: false,
  entities: [User, Game, Review, BuySell],
};

export const appDataSource = new DataSource(databaseConfig);

export function getRepository(entity) {
  if (!appDataSource.isInitialized) {
    throw new Error("Data source is not initialized");
  }

  return appDataSource.getRepository(entity);
}

export async function initDatabase() {
  if (!appDataSource.isInitialized) {
    await appDataSource.initialize();
  }
}
