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

export async function getMe(req, res) {
  try {
    const user = req.user;
    
    return res.json(user);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}