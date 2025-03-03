import express from "express";
import { getAllProducts, createProduct, getProduct, deleteProduct, updateProduct } from "../controllers/productController";

const router = express.Router();

router.get("/products", getAllProducts);
router.get("/product/:id", getProduct);
router.post("/product/add", createProduct);
router.patch("/product/:id", updateProduct);
router.delete("/product/:id", deleteProduct);
export default router;
