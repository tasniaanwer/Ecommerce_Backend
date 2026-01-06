import express from "express";
import {

  createProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  productCategoryController,
  productCountController,
  productFiltersController,
  productListController,
  productPhotoController,
  realtedProductController,
  searchProductController,
  updateProductController,
  mockPaymentController,

} from "../controllers/productController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import formidable from "express-formidable";

const router = express.Router();

//routes
router.post(
  "/create-product",
  (req, res, next) => {
    console.log("=== BEFORE AUTH ===");
    console.log("Headers:", req.headers);
    console.log("Authorization:", req.headers.authorization);
    next();
  },
  requireSignIn,
  isAdmin,
  (req, res, next) => {
    console.log("=== BEFORE FORMIDABLE ===");
    console.log("After auth, user:", req.user);
    next();
  },
  formidable({
    multiples: true,
    keepExtensions: true,
    maxFileSize: 2 * 1024 * 1024, // 2MB
    filter: function ({name, originalFilename, mimetype}) {
      // keep only images
      return mimetype && mimetype.includes("image");
    }
  }),
  (req, res, next) => {
    console.log("=== AFTER FORMIDABLE ===");
    console.log("Fields:", req.fields);
    console.log("Files:", req.files);
    next();
  },
  createProductController
);
//routes
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

//get products
router.get("/get-product", getProductController);

//single product
router.get("/get-product/:slug", getSingleProductController);

//get photo
router.get("/product-photo/:pid", productPhotoController);

//delete rproduct
router.delete("/delete-product/:pid", deleteProductController);

//filter product
router.post("/product-filters", productFiltersController);

//product count
router.get("/product-count", productCountController);

//product per page
router.get("/product-list/:page", productListController);

//search product
router.get("/search/:keyword", searchProductController);

//similar product
router.get("/related-product/:pid/:cid", realtedProductController);

//category wise product
router.get("/product-category/:slug", productCategoryController);

// Mock Payment Route
router.post("/mock-payment", requireSignIn, mockPaymentController);

export default router;