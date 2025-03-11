import express from "express";
import {getCustomer, getAllCustomers} from "../controllers/customerController";

const router = express.Router();

router.get("/customers", getAllCustomers);
router.get("/customer/:id", getCustomer);

export default router;