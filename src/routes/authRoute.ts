import express from "express";
import { registerUser, loginUser, changePassword, forgetPassword, resetPassword, verifyResetToken } from "../controllers/authController";

const router = express.Router();

router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.post('/auth/change-password', changePassword);
router.post('/auth/forget-password', forgetPassword);
router.get('/auth/verify-reset-token', verifyResetToken);
router.post('/auth/reset-password', resetPassword);
export default router;