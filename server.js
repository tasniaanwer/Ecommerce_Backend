import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

import { connectDB } from "./config/db.js";

// routes
import authRoute from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import bkashPaymentRoute from "./routes/bkashPayment.routes.js"; // ✅ ADD THIS
import stripePaymentRoute from "./routes/stripePayment.routes.js"; // ✅ Stripe payment route

// config env
dotenv.config();

// database config
connectDB();

// app init
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

// ✅ bKash route
app.use("/api/bkash", bkashPaymentRoute);
// ✅ Stripe route
app.use("/api/stripe", stripePaymentRoute);

// test route
app.get("/", (req, res) => {
  res.send("<h1>Welcome to ecommerce app with bKash</h1>");
});

// port
const PORT = process.env.PORT || 8001;

// server listen
app.listen(PORT, () => {
  console.log(
    `Server Running on ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan.white
  );
});
