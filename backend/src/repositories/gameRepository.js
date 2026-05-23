import { Game } from "../models/Game.js";
import { User } from "../models/User.js";
import { getRepository } from "../config/database.js";

export async function listGames() {
  return getRepository(Game).find({
    order: { id: "ASC" },
  });
}

export async function getGameById(id) {
  return getRepository(Game).findOneBy({ id });
}

export async function createGame({ title, genre, releaseYear, coverImage }) {
  const repository = getRepository(Game);
  const game = repository.create({ title, genre, releaseYear, coverImage });
  return repository.save(game);
}

export async function updateGame(id, data) {
  const repository = getRepository(Game);
  const game = await repository.findOneBy({ id });

  if (!game) {
    return null;
  }

  Object.assign(game, data);
  return repository.save(game);
}

export async function removeGame(id) {
  const result = await getRepository(Game).delete({ id });
  return (result.affected ?? 0) > 0;
}

export async function listGamesByUserId(userId) {
  const user = await getRepository(User).findOne({
    where: { id: userId },
    relations: {
      games: true,
    },
  });

  if (!user) {
    return null;
  }

  return user.games.sort((a, b) => a.id - b.id);
}

export async function addGameToUser(userId, gameId) {
  const userRepository = getRepository(User);
  const gameRepository = getRepository(Game);

  const user = await userRepository.findOne({
    where: { id: userId },
    relations: {
      games: true,
    },
  });
  const game = await gameRepository.findOneBy({ id: gameId });

  if (!user || !game) {
    return { user, game, created: false };
  }

  const alreadyLinked = user.games.some((userGame) => userGame.id === game.id);
  if (!alreadyLinked) {
    user.games.push(game);
    await userRepository.save(user);
  }

  return { user, game, created: true };
}

export async function removeGameFromUser(userId, gameId) {
  const userRepository = getRepository(User);
  const gameRepository = getRepository(Game);

  const user = await userRepository.findOne({
    where: { id: userId },
    relations: {
      games: true,
    },
  });
  const game = await gameRepository.findOneBy({ id: gameId });

  if (!user || !game) {
    return { user, game, removed: false };
  }

  user.games = user.games.filter((userGame) => userGame.id !== game.id);
  await userRepository.save(user);

  return { user, game, removed: true };
}