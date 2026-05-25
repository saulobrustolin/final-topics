import { Router } from "express";
import * as searchController from "../controllers/searchController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search for albums and musics
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword for album or music title
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 albuns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       artist:
 *                         type: string
 *                       albumUrl:
 *                         type: string
 *                 musics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       duration:
 *                         type: string
 *                       coverUrl:
 *                         type: string
 *                       artistics:
 *                         type: array
 *                         items:
 *                           type: string
 *                       musicUrl:
 *                         type: string
 */
router.get("/", searchController.search);

export default router;
