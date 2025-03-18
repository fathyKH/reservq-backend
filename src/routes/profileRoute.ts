import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController";
import upload from "../config/s3Storage";

const router = express.Router();

router.get("/profile", getProfile);
router.patch(
    "/profile",
    upload.single("profileImage"),
    updateProfile
);
export default router;