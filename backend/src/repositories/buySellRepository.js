import { BuySell } from "../models/BuySell.js";
import { getRepository } from "../config/database.js";

export async function listBuySells() {
  return getRepository(BuySell).find({
    relations: {
      user: true,
      game: true,
    },
    order: { id: "ASC" },
  });
}

export async function getBuySellById(id) {
  return getRepository(BuySell).findOne({
    where: { id },
    relations: {
      user: true,
      game: true,
    },
  });
}

export async function createBuySell({ userId, gameId, date, finalPrice, status }) {
  const repository = getRepository(BuySell);
  const buySell = repository.create({
    userId,
    gameId,
    date,
    finalPrice,
    status,
  });
  const savedBuySell = await repository.save(buySell);
  return getBuySellById(savedBuySell.id);
}

export async function updateBuySell(id, data) {
  const repository = getRepository(BuySell);
  const buySell = await repository.findOneBy({ id });

  if (!buySell) {
    return null;
  }

  Object.assign(buySell, data);
  await repository.save(buySell);
  return getBuySellById(id);
}

export async function removeBuySell(id) {
  const result = await getRepository(BuySell).delete({ id });
  return (result.affected ?? 0) > 0;
}
