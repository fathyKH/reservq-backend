import express from "express";
import { handleStripeWebhook } from "../webhooks/stripe";

const router = express.Router();

router.post("/webhooks/stripe",express.raw({type: "application/json"}), handleStripeWebhook);

export default router;