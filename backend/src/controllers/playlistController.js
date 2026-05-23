import {
  findAllBuySells,
  findBuySellById,
  registerBuySell,
  editBuySell,
  deleteBuySell,
} from "../services/paylistService.js";

function parseId(idParam) {
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
}

export async function getPlaylists(req, res) {
  try {
    const playlists = await findAllBuySells();
    return res.json(buySells);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function getBuySell(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const buySell = await findBuySellById(id);
    if (!buySell) {
      return res.status(404).json({ message: req.__("errors.buy_sell_not_found") });
    }

    return res.json(buySell);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function createNewBuySell(req, res) {
  try {
    const result = await registerBuySell(req.body);

    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }

    return res.status(result.status).json(result.data);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function updateExistingBuySell(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await editBuySell(id, req.body);

    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }

    return res.status(result.status).json(result.data);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function deleteExistingBuySell(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await deleteBuySell(id);

    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }

    return res.status(result.status).send();
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}
