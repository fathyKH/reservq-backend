import express from "express";
import { getAllOrders, createOrder, getOrder, deleteOrder, updateOrder } from "../controllers/orderController";
const router = express.Router();

router.get("/orders", getAllOrders);
router.post("/order/add", createOrder);
router.patch("/order/:id", updateOrder);
router.delete("/order/:id", deleteOrder);
router.get("/order/:id", getOrder);

export default router;