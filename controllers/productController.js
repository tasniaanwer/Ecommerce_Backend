import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import fs from "fs";
import slugify from "slugify";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js";  // Ensure you have an order model
import mongoose from "mongoose";


dotenv.config();


export const createProductController = async (req, res) => {
  try {
    console.log("=== CREATE PRODUCT CONTROLLER CALLED ===");
    console.log("req.fields:", req.fields);
    console.log("req.files:", req.files);

    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validation
    switch (true) {
      case !name || name.trim() === "":
        return res.status(400).send({ error: "Name is Required" });
      case !description || description.trim() === "":
        return res.status(400).send({ error: "Description is Required" });
      case !price || isNaN(price):
        return res.status(400).send({ error: "Valid Price is Required" });
      case !category:
        return res.status(400).send({ error: "Category is Required" });
      case !quantity || isNaN(quantity):
        return res.status(400).send({ error: "Valid Quantity is Required" });
      case !photo:
        return res.status(400).send({ error: "Photo is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(400)
          .send({ error: "Photo should be less than 1mb" });
    }

    // Check if category exists
    const categoryExists = await categoryModel.findById(category);
    if (!categoryExists) {
      return res.status(400).send({ error: "Invalid Category" });
    }

    const products = new productModel({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      quantity: parseInt(quantity),
      shipping: shipping === "1" || shipping === true,
      slug: slugify(name.trim())
    });

    if (photo) {
      try {
        products.photo.data = fs.readFileSync(photo.path);
        products.photo.contentType = photo.type;
      } catch (fileError) {
        console.log("File reading error:", fileError);
        return res.status(400).send({ error: "Error reading photo file" });
      }
    }

    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } catch (error) {
    console.log("=== ERROR IN CREATE PRODUCT ===");
    console.log("Full error:", error);
    console.log("Error stack:", error.stack);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in creating product",
    });
  }
};

//get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: "ALlProducts ",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting products",
      error: error.message,
    });
  }
};
// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};

// get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};

//delete controller
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

//upate producta
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //alidation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is Required and should be less then 1mb" });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Updte product",
    });
  }
};

// filters
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// product list base on page
export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

// search product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

// similar products
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

// get prdocyst by catgory
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};


// Mock Payment Controller
export const mockPaymentController = async (req, res) => {
  try {
    const { cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });

    const order = new orderModel({
      products: cart,
      payment: { status: "success", amount: total },
      buyer: req.user._id,
    });
    await order.save();

    res.status(200).send({
      success: true,
      message: "Payment completed and order created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in processing payment",
      error,
    });
  }
};

// Create Order Controller (for Stripe and other payment methods)
export const createOrderController = async (req, res) => {
  try {
    const { cart, paymentMethod, paymentId, amount } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Cart is empty",
      });
    }

    // Extract product IDs from cart
    const productIds = cart.map((item) => item._id || item.id);

    // Calculate total if not provided
    let total = amount;
    if (!total) {
      total = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
    }

    // Debug: Log the cart structure
    console.log("=== CART STRUCTURE DEBUG ===");
    console.log("Cart items:", JSON.stringify(cart, null, 2));
    
    // Count quantity of each product in cart
    // IMPORTANT: Each item in cart array = 1 unit purchased
    // The item.quantity field is the PRODUCT'S stock quantity, NOT purchase quantity
    // So we always count each cart item as 1 unit
    const productQuantityMap = {};
    cart.forEach((item, index) => {
      const productId = item._id || item.id;
      // Each cart item represents 1 unit purchased (regardless of item.quantity which is stock)
      const purchaseQuantity = 1; // Always 1 unit per cart item
      productQuantityMap[productId] = (productQuantityMap[productId] || 0) + purchaseQuantity;
      console.log(`Cart item ${index}: ID=${productId}, Purchase Quantity=${purchaseQuantity}, Name=${item.name || 'N/A'}, Stock Quantity=${item.quantity || 'N/A'}`);
    });

    console.log("=== PRODUCT QUANTITY MAP ===");
    console.log("Product quantity map:", JSON.stringify(productQuantityMap, null, 2));

    // Reduce product quantities in database
    for (const [productId, quantityToReduce] of Object.entries(productQuantityMap)) {
      try {
        // Convert productId to ObjectId if it's a string
        let productObjectId = productId;
        if (typeof productId === 'string' && mongoose.Types.ObjectId.isValid(productId)) {
          productObjectId = new mongoose.Types.ObjectId(productId);
        }
        
        // Find the product first to verify it exists and get current quantity
        const product = await productModel.findById(productObjectId);
        
        if (!product) {
          console.log(`⚠️ Product ${productId} not found in database`);
          continue; // Skip this product
        }

        // Get current quantity
        const currentQuantity = Number(product.quantity);
        if (isNaN(currentQuantity) || currentQuantity === null || currentQuantity === undefined) {
          console.log(`⚠️ Product ${productId} has invalid quantity: ${product.quantity}`);
          continue; // Skip this product
        }
        
        console.log(`📦 Product ${productId} (${product.name}): Current quantity = ${currentQuantity}, Reducing by = ${quantityToReduce}`);
        
        // Ensure we don't reduce below 0
        const actualReduction = Math.min(quantityToReduce, currentQuantity);
        
        // Use $inc operator to decrement quantity atomically
        // This ensures thread-safe updates and prevents race conditions
        const updatedProduct = await productModel.findByIdAndUpdate(
          productObjectId,
          { $inc: { quantity: -actualReduction } }, // Decrement by actualReduction
          { new: true }
        );
        
        if (updatedProduct) {
          const newQuantity = Number(updatedProduct.quantity) || 0;
          console.log(`✅ Successfully reduced quantity for product ${productId} (${product.name}): ${currentQuantity} -> ${newQuantity} (reduced by ${actualReduction})`);
          
          // Double-check: ensure quantity is not negative
          if (newQuantity < 0) {
            console.log(`⚠️ Warning: Product ${productId} quantity became negative (${newQuantity}), setting to 0`);
            await productModel.findByIdAndUpdate(productId, { quantity: 0 });
          }
        } else {
          console.log(`❌ Failed to update product ${productId}`);
        }
      } catch (productError) {
        console.error(`❌ Error reducing quantity for product ${productId}:`, productError);
        console.error(`Error details:`, productError.message);
        // Continue with other products even if one fails
      }
    }

    const order = new orderModel({
      products: productIds,
      payment: {
        method: paymentMethod || "stripe",
        status: "success",
        amount: total,
        paymentId: paymentId,
      },
      buyer: req.user._id,
    });

    await order.save();

    res.status(200).send({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.log("Create order error:", error);
    res.status(500).send({
      success: false,
      message: "Error in creating order",
      error: error.message,
    });
  }
};