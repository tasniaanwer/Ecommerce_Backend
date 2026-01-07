import { createStripePayment, verifyStripePayment, stripeWebhook, testStripeConnection } from "../controllers/stripePayment.controller.js";
import express from "express";

const router = express.Router();

// Test Stripe connection (for debugging)
router.get("/test", testStripeConnection);

// Create Stripe payment session
router.post("/create", createStripePayment);

// Verify Stripe payment
router.get("/verify", verifyStripePayment);

// Stripe webhook (for production, use raw body)
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default router;
