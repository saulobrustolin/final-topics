import { Router } from "express";
import * as musicController from "../controllers/musicController.js";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.use(protect);

/**
 * @swagger
 * /music/{id}:
 *   get:
 *     summary: Get music details
 *     tags: [Music]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Music data
 *       404:
 *         description: Music not found
 *   patch:
 *     summary: Update music information
 *     tags: [Music]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               duration:
 *                 type: integer
 *               audio:
 *                 type: string
 *                 format: binary
 *               cover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated music
 *       403:
 *         description: Forbidden (not owner or not artist)
 */
router.get("/:id", musicController.getMusicById);

/**
 * @swagger
 * /music/{id}/play:
 *   get:
 *     summary: Play music (get HLS manifesto URL)
 *     tags: [Music]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: HLS manifesto URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 */
router.get("/:id/play", musicController.playMusic);

/**
 * @swagger
 * /music/stream/{id}/{file}:
 *   get:
 *     summary: Stream HLS files (manifesto or segments)
 *     tags: [Music]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: file
 *         required: true
 *         schema:
 *           type: string
 *         description: Filename (e.g., index.m3u8 or segment.ts)
 *     responses:
 *       200:
 *         description: Media file stream
 */
router.get("/stream/:id/:file", musicController.streamMusic);

router.patch("/:id", upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), musicController.updateMusic);

export default router;
