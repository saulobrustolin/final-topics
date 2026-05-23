import {
  findAllUsers,
  findUserById,
  registerUser,
  editUser,
  deleteUser,
} from "../services/userService.js";

function parseId(idParam) {
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
}

export async function getUsers(req, res) {
  try {
    const users = await findAllUsers();
    return res.json(users);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function getUser(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ message: req.__("errors.user_not_found") });
    }

    return res.json(user);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function createNewUser(req, res) {
  try {
    const result = await registerUser(req.body);

    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }

    return res.status(result.status).json(result.data);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function updateExistingUser(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await editUser(id, req.body);

    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }

    return res.status(result.status).json(result.data);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function deleteExistingUser(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await deleteUser(id);

    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }

    return res.status(result.status).send();
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}
