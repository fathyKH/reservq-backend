import express from "express";
import { registerUser, loginUser, resetPassword } from "../controllers/userController";

const router = express.Router();

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.post('/user/reset-password', resetPassword);

export default router;