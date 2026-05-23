import { getUserById } from "../repositories/userRepository.js";
import {
  listGames,
  getGameById,
  createGame,
  updateGame,
  removeGame,
  listGamesByUserId,
  addGameToUser,
  removeGameFromUser,
} from "../repositories/gameRepository.js";

function parseReleaseYear(releaseYear) {
  if (releaseYear === undefined || releaseYear === null || releaseYear === "") {
    return null;
  }

  const parsed = Number(releaseYear);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function validateGamePayload({ title, genre, releaseYear, coverImage }) {
  if (!title || !genre) {
    return { errorKey: "errors.required_title_genre", status: 400 };
  }

  const parsedYear = parseReleaseYear(releaseYear);
  if (parsedYear === undefined) {
    return { errorKey: "errors.invalid_release_year", status: 400 };
  }

  return { parsedYear };
}

export async function findAllGames() {
  return listGames();
}

export async function findGameById(id) {
  return getGameById(id);
}

export async function registerGame(payload) {
  const validation = validateGamePayload(payload);
  if (validation.errorKey) {
    return validation;
  }

  const game = await createGame({
    title: payload.title,
    genre: payload.genre,
    releaseYear: validation.parsedYear,
    coverImage: payload.coverImage,
  });

  return { data: game, status: 201 };
}

export async function editGame(id, payload) {
  const currentGame = await getGameById(id);
  if (!currentGame) {
    return { errorKey: "errors.game_not_found", status: 404 };
  }

  const nextTitle = payload.title ?? currentGame.title;
  const nextGenre = payload.genre ?? currentGame.genre;
  const nextReleaseYear = payload.releaseYear ?? currentGame.releaseYear;
  const nextCoverImage = payload.coverImage ?? currentGame.coverImage;

  const validation = validateGamePayload({
    title: nextTitle,
    genre: nextGenre,
    releaseYear: nextReleaseYear,
    coverImage: nextCoverImage,
  });

  if (validation.errorKey) {
    return validation;
  }

  const updated = await updateGame(id, {
    title: nextTitle,
    genre: nextGenre,
    releaseYear: validation.parsedYear,
    coverImage: nextCoverImage,
  });

  return { data: updated, status: 200 };
}

export async function deleteGame(id) {
  const deleted = await removeGame(id);
  if (!deleted) {
    return { errorKey: "errors.game_not_found", status: 404 };
  }

  return { status: 204 };
}

export async function findGamesByUserId(userId) {
  const games = await listGamesByUserId(userId);
  if (games === null) {
    return { errorKey: "errors.user_not_found", status: 404 };
  }

  return { data: games, status: 200 };
}

export async function linkUserToGame(userId, gameId) {
  const user = await getUserById(userId);
  if (!user) {
    return { errorKey: "errors.user_not_found", status: 404 };
  }

  const game = await getGameById(gameId);
  if (!game) {
    return { errorKey: "errors.game_not_found", status: 404 };
  }

  await addGameToUser(userId, gameId);
  return { status: 204 };
}

export async function unlinkUserFromGame(userId, gameId) {
  const user = await getUserById(userId);
  if (!user) {
    return { errorKey: "errors.user_not_found", status: 404 };
  }

  const game = await getGameById(gameId);
  if (!game) {
    return { errorKey: "errors.game_not_found", status: 404 };
  }

  await removeGameFromUser(userId, gameId);
  return { status: 204 };
}