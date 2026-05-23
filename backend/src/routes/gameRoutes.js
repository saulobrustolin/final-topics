import { Router } from "express";
import {
  getGames,
  getGame,
  createNewGame,
  updateExistingGame,
  deleteExistingGame,
} from "../controllers/gameController.js";

const router = Router();

router.get("/", getGames);
router.get("/:id", getGame);
router.post("/", createNewGame);
router.put("/:id", updateExistingGame);
router.delete("/:id", deleteExistingGame);

export default router;