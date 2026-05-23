import { getUserById } from "../repositories/userRepository.js";
import { getGameById } from "../repositories/gameRepository.js";
import {
  listBuySells,
  getBuySellById,
  createBuySell,
  updateBuySell,
  removeBuySell,
} from "../repositories/buySellRepository.js";

function parseDate(value) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString().slice(0, 10);
}

function parseFinalPrice(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function parseStatus(value) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return value.trim();
}

function validateBuySellPayload({ userId, gameId, date, finalPrice, status }) {
  if (
    userId === undefined ||
    gameId === undefined ||
    date === undefined ||
    finalPrice === undefined ||
    status === undefined
  ) {
    return { errorKey: "errors.required_buy_sell_fields", status: 400 };
  }

  const parsedUserId = Number(userId);
  const parsedGameId = Number(gameId);
  const parsedDate = parseDate(date);
  const parsedFinalPrice = parseFinalPrice(finalPrice);
  const parsedStatus = parseStatus(status);

  if (!Number.isInteger(parsedUserId) || !Number.isInteger(parsedGameId)) {
    return { errorKey: "errors.invalid_id", status: 400 };
  }

  if (!parsedDate) {
    return { errorKey: "errors.invalid_buy_sell_date", status: 400 };
  }

  if (parsedFinalPrice === undefined) {
    return { errorKey: "errors.invalid_final_price", status: 400 };
  }

  if (!parsedStatus) {
    return { errorKey: "errors.invalid_buy_sell_status", status: 400 };
  }

  return {
    parsedUserId,
    parsedGameId,
    parsedDate,
    parsedFinalPrice,
    parsedStatus,
  };
}

function validateBuySellUpdatePayload(payload) {
  if (
    payload.userId === undefined &&
    payload.gameId === undefined &&
    payload.date === undefined &&
    payload.finalPrice === undefined &&
    payload.status === undefined
  ) {
    return { errorKey: "errors.required_buy_sell_update_fields", status: 400 };
  }

  return {};
}

export async function findAllBuySells() {
  return listBuySells();
}

export async function findBuySellById(id) {
  return getBuySellById(id);
}

export async function registerBuySell(payload) {
  const validation = validateBuySellPayload(payload);
  if (validation.errorKey) {
    return validation;
  }

  const user = await getUserById(validation.parsedUserId);
  if (!user) {
    return { errorKey: "errors.user_not_found", status: 404 };
  }

  const game = await getGameById(validation.parsedGameId);
  if (!game) {
    return { errorKey: "errors.game_not_found", status: 404 };
  }

  const buySell = await createBuySell({
    userId: validation.parsedUserId,
    gameId: validation.parsedGameId,
    date: validation.parsedDate,
    finalPrice: validation.parsedFinalPrice,
    status: validation.parsedStatus,
  });

  return { data: buySell, status: 201 };
}

export async function editBuySell(id, payload) {
  const currentBuySell = await getBuySellById(id);
  if (!currentBuySell) {
    return { errorKey: "errors.buy_sell_not_found", status: 404 };
  }

  const updateValidation = validateBuySellUpdatePayload(payload);
  if (updateValidation.errorKey) {
    return updateValidation;
  }

  const nextPayload = {
    userId: payload.userId ?? currentBuySell.userId,
    gameId: payload.gameId ?? currentBuySell.gameId,
    date: payload.date ?? currentBuySell.date,
    finalPrice: payload.finalPrice ?? currentBuySell.finalPrice,
    status: payload.status ?? currentBuySell.status,
  };

  const validation = validateBuySellPayload(nextPayload);
  if (validation.errorKey) {
    return validation;
  }

  const user = await getUserById(validation.parsedUserId);
  if (!user) {
    return { errorKey: "errors.user_not_found", status: 404 };
  }

  const game = await getGameById(validation.parsedGameId);
  if (!game) {
    return { errorKey: "errors.game_not_found", status: 404 };
  }

  const updated = await updateBuySell(id, {
    userId: validation.parsedUserId,
    gameId: validation.parsedGameId,
    date: validation.parsedDate,
    finalPrice: validation.parsedFinalPrice,
    status: validation.parsedStatus,
  });

  return { data: updated, status: 200 };
}

export async function deleteBuySell(id) {
  const deleted = await removeBuySell(id);
  if (!deleted) {
    return { errorKey: "errors.buy_sell_not_found", status: 404 };
  }

  return { status: 204 };
}
