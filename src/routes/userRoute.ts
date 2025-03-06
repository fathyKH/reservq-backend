import express from "express";
import { registerUser, loginUser, changePassword } from "../controllers/userController";

const router = express.Router();

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.post('/user/change-password', changePassword);

export default router;