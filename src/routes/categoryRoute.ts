import express from "express";
import { getAllCategories, createCategory, getCategory, updateCategory, deleteOrDeactivateCategory } from "../controllers/categoryController";
const router = express.Router();

router.get("/categories", getAllCategories);
router.get("/category/:id", getCategory);
router.post("/category/add", createCategory);
router.patch("/category/:id", updateCategory);
router.delete("/category/:id", deleteOrDeactivateCategory);
export default router;