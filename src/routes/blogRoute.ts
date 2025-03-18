import express from "express";
import { getAllBlogs, getBlogById, createBlog, deleteBlog, updateBlog } from "../controllers/blogController";
import upload from "../config/s3Storage";

const router = express.Router();

router.get("/blogs", getAllBlogs);
router.get("/blog/:id", getBlogById);
router.post("/blog/add",upload.single("image"), createBlog);
router.patch("/blog/:id",upload.single("image"), updateBlog);
router.delete("/blog/:id", deleteBlog);
export default router;