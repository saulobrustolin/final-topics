import { Router } from "express";
import { authController } from "../controllers/authController.js";

const router = Router();

router.name = "Rota de autenticação";

router.post('/register', authController.register);
router.post('/login', authController.login);