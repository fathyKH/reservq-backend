import express from "express";
import { createReview, getReviews, editReview, deleteReview } from "../controllers/reviewController"; 

const router = express.Router();

router.get("/reviews/:id", getReviews);
router.post("/review/add", createReview);
router.patch("/review/:id", editReview);
router.delete("/review/:id", deleteReview);

export default router;