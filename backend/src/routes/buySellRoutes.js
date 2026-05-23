import { Router } from "express";
import {
  getBuySells,
  getBuySell,
  createNewBuySell,
  updateExistingBuySell,
  deleteExistingBuySell,
} from "../controllers/buySellController.js";

const router = Router();

router.get("/", getBuySells);
router.get("/:id", getBuySell);
router.post("/", createNewBuySell);
router.put("/:id", updateExistingBuySell);
router.delete("/:id", deleteExistingBuySell);

export default router;
