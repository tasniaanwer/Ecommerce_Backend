import { createPayment, bkashCallback } from "../controllers/bkashPayment.controller.js";
import { grantToken } from "../utils/grantToken.js";
import express from "express";

const router = express.Router();

router.use(grantToken); // will set token for all bkash routes

router.post("/create", createPayment);
router.get("/callback", bkashCallback);

export default router;
