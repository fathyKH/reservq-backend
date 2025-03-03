import express from "express";
import { getAllDiscounts, createDiscount, getDiscount, deleteDiscount, updateDiscount, checkDiscount } from "../controllers/discountController";
const router = express.Router();

router.get("/discounts", getAllDiscounts);
router.get("/discount/:id", getDiscount);
router.post("/discount/add", createDiscount);
router.post("/discount/check", checkDiscount);
router.patch("/discount/:id", updateDiscount);
router.delete("/discount/:id", deleteDiscount);
export default router;