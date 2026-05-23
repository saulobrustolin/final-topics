import { Router } from "express";
import {
  getReviews,
  getReview,
  createNewReview,
  updateExistingReview,
  deleteExistingReview,
} from "../controllers/reviewController.js";

const router = Router();

router.get("/", getReviews);
router.get("/:id", getReview);
router.post("/", createNewReview);
router.put("/:id", updateExistingReview);
router.delete("/:id", deleteExistingReview);

export default router;