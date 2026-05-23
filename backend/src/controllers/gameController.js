import {
  findAllGames,
  findGameById,
  registerGame,
  editGame,
  deleteGame,
  findGamesByUserId,
  linkUserToGame,
  unlinkUserFromGame,
} from "../services/gameService.js";

function parseId(idParam) {
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
}

export async function getGames(req, res) {
  try {
    const games = await findAllGames();
    return res.json(games);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function getGame(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const game = await findGameById(id);
    if (!game) {
      return res.status(404).json({ message: req.__("errors.game_not_found") });
    }

    return res.json(game);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function createNewGame(req, res) {
  try {
    const result = await registerGame(req.body);

    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }

    return res.status(result.status).json(result.data);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function updateExistingGame(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await editGame(id, req.body);

    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }

    return res.status(result.status).json(result.data);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function deleteExistingGame(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await deleteGame(id);

    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }

    return res.status(result.status).send();
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function getUserGames(req, res) {
  const userId = parseId(req.params.userId);
  if (userId === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await findGamesByUserId(userId);

    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }

    return res.status(result.status).json(result.data);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function addUserGame(req, res) {
  const userId = parseId(req.params.userId);
  const gameId = parseId(req.params.gameId);

  if (userId === null || gameId === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await linkUserToGame(userId, gameId);

    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }

    return res.status(result.status).send();
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function removeUserGame(req, res) {
  const userId = parseId(req.params.userId);
  const gameId = parseId(req.params.gameId);

  if (userId === null || gameId === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await unlinkUserFromGame(userId, gameId);

    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }

    return res.status(result.status).send();
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}