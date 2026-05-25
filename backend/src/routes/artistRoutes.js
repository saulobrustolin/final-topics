import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.use(protect);

/**
 * @swagger
 * /artist/{id}:
 *   get:
 *     summary: Get public playlists and albums of an artist
 *     tags: [Artist]
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
 *         description: Artist data including albums and public playlists
 *       404:
 *         description: Artist not found
 */
router.get("/:id", userController.getArtistData);

/**
 * @swagger
 * /artist/{artistId}/{musicId}:
 *   patch:
 *     summary: Update a music as an artist
 *     tags: [Artist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: artistId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: musicId
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
 *         description: Forbidden (not the artist or not owner)
 */
router.patch("/:artistId/:musicId", upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), userController.updateArtistMusic);

export default router;
