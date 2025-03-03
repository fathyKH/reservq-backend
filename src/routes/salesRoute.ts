import express from "express";
import { getReports } from "../controllers/salesController";

const router = express.Router();

router.get("/reports", getReports);

export default router;