import { Router } from "express";
import {
  getUsers,
  getUser,
  createNewUser,
  updateExistingUser,
  deleteExistingUser,
} from "../controllers/userController.js";
import {
  getUserGames,
  addUserGame,
  removeUserGame,
} from "../controllers/gameController.js";

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", createNewUser);
router.put("/:id", updateExistingUser);
router.delete("/:id", deleteExistingUser);
router.get("/:userId/games", getUserGames);
router.post("/:userId/games/:gameId", addUserGame);
router.delete("/:userId/games/:gameId", removeUserGame);

export default router;
