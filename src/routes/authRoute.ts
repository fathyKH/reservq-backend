import express from "express";
import { registerUser, loginUser, changePassword } from "../controllers/authController";

const router = express.Router();

router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.post('/auth/change-password', changePassword);

export default router;