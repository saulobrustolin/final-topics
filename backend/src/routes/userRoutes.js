import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get current user info
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 */
router.get("/", userController.getMe);

export default router;
