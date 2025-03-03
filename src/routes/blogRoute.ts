import express from "express";
import { getAllBlogs, getBlogById, createBlog, deleteBlog, updateBlog } from "../controllers/blogController";

const router = express.Router();

router.get("/blogs", getAllBlogs);
router.get("/blog/:id", getBlogById);
router.post("/blog/add", createBlog);
router.patch("/blog/:id", updateBlog);
router.delete("/blog/:id", deleteBlog);
export default router;