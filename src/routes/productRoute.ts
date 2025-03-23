import express from "express";
import { getAllProducts, createProduct, getProduct, deleteProduct, updateProduct } from "../controllers/productController";
import upload from "../config/s3Storage";

const router = express.Router();

router.get("/products", getAllProducts);
router.get("/product/:id", getProduct);
router.post("/product/add",upload.array("images"), createProduct);
router.patch("/product/:id",upload.array("images"), updateProduct);
router.delete("/product/:id", deleteProduct);
export default router;
