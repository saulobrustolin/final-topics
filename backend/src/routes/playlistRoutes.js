import { Router } from "express";
import * as playlistController from "../controllers/playlistController.js";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.use(protect);

/**
 * @swagger
 * /playlist:
 *   post:
 *     summary: Create a new playlist
 *     tags: [Playlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *               cover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Playlist created successfully
 *   get:
 *     summary: List all user playlists
 *     tags: [Playlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of playlists
 */
router.post("/", upload.single('cover'), playlistController.createPlaylist);
router.get("/", playlistController.getPlaylists);

/**
 * @swagger
 * /playlist/{id}:
 *   get:
 *     summary: Get playlist details
 *     tags: [Playlist]
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
 *         description: Playlist data
 *       403:
 *         description: Forbidden (private playlist)
 *       404:
 *         description: Playlist not found
 *   patch:
 *     summary: Update playlist information
 *     tags: [Playlist]
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
 *               description:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *               cover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated playlist
 *   post:
 *     summary: Add music to playlist
 *     tags: [Playlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [musicId]
 *             properties:
 *               musicId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Music added successfully
 */
router.get("/:id", playlistController.getPlaylistById);
router.patch("/:id", upload.single('cover'), playlistController.updatePlaylist);
router.post("/:id", playlistController.addMusicToPlaylist);
router.post("/:id/follow", playlistController.followPlaylist);
router.delete("/:id/follow", playlistController.unfollowPlaylist);

/**
 * @swagger
 * /playlist/{playlistId}/{musicId}:
 *   delete:
 *     summary: Remove music from playlist
 *     tags: [Playlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: musicId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Music removed successfully
 */
router.delete("/:playlistId/:musicId", playlistController.removeMusicFromPlaylist);

export default router;
