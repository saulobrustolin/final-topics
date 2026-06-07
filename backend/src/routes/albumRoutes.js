import { Router } from "express";
import * as albumController from "../controllers/albumController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import UserRole from "../models/enums/UserRole.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.use(protect);

/**
 * @swagger
 * /album/mine:
 *   get:
 *     summary: List current artist's albums
 *     tags: [Album]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of albums
 */
router.get("/mine", restrictTo(UserRole.ARTIST, UserRole.ADMIN), albumController.listMyAlbums);

/**
 * @swagger
 * /album:
 *   post:
 *     summary: Create a new album with musics
 *     tags: [Album]
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
 *               cover:
 *                 type: string
 *                 format: binary
 *               musics:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Album created successfully
 *       403:
 *         description: Forbidden (not an artist)
 */
router.post("/", 
  restrictTo(UserRole.ARTIST, UserRole.ADMIN), 
  upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'musics', maxCount: 20 }]), 
  albumController.createAlbum
);

/**
 * @swagger
 * /album/{id}:
 *   get:
 *     summary: Get all musics from an album
 *     tags: [Album]
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
 *         description: List of musics
 *       404:
 *         description: Album not found
 */
router.get("/:id", albumController.getAlbumById);

export default router;
