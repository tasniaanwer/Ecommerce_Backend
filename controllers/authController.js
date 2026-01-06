import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";

// Register Controller
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    // Validations
    if (!name) return res.status(400).send({ success: false, message: "Name is Required" });
    if (!email) return res.status(400).send({ success: false, message: "Email is Required" });
    if (!password || password.length < 3) return res.status(400).send({ success: false, message: "Password must be at least 3 characters" });
    if (!phone) return res.status(400).send({ success: false, message: "Phone no is Required" });
    if (!address) return res.status(400).send({ success: false, message: "Address is Required" });
    if (!answer) return res.status(400).send({ success: false, message: "Answer is Required" });

    // Check user
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Register please login",
      });
    }

    // Register user
    const hashedPassword = await hashPassword(password);
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();

    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};

// Login Controller
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

// Forgot Password Controller
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) return res.status(400).send({ message: "Email is required" });
    if (!answer) return res.status(400).send({ message: "Answer is required" });
    if (!newPassword) return res.status(400).send({ message: "New Password is required" });

    const user = await userModel.findOne({ email, answer });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email Or Answer",
      });
    }

    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

// Test Controller
export const testController = (req, res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

// Update Profile Controller
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    if (password && password.length < 3) {
      return res.json({ error: "Password is required and should be 3 characters long" });
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error While Updating Profile",
      error,
    });
  }
};

export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    console.log("User Orders: ", orders); // Debugging line
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Getting Orders",
      error,
    });
  }
};

export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });
    console.log("All Orders: ", orders); // Debugging line
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Getting Orders",
      error,
    });
  }
};


// Order Status Controller
/*export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updating Order",
      error,
    });
  }
};
*/

// Send Verification Code Controller
export const sendVerificationController = async (req, res) => {
  try {
    const { email, phone, method } = req.body;

    // Generate a 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // In a real application, you would:
    // - Send email using nodemailer for email method
    // - Send SMS using Twilio or similar service for phone method
    // - Store the code temporarily in Redis or database with expiry

    console.log(`Verification code for ${method}: ${verificationCode}`);

    // For demo purposes, we'll just return success
    res.status(200).send({
      success: true,
      message: `Verification code sent via ${method === 'email' ? 'email' : 'SMS'}`,
      // In production, don't send the code in response
      code: process.env.NODE_ENV === 'development' ? verificationCode : undefined
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error sending verification code",
      error,
    });
  }
};

// Enhanced Password Reset with Verification
export const verifyResetController = async (req, res) => {
  try {
    const { email, phone, verificationCode, newPassword } = req.body;

    // In a real application, verify the code from Redis/database
    // For demo, we'll accept any 6-digit code
    if (verificationCode && verificationCode.length !== 6) {
      return res.status(400).send({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Find user by email or phone
    const user = await userModel.findOne({
      $or: email ? [{ email }] : [{ phone }]
    });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await userModel.findByIdAndUpdate(user._id, { password: hashedPassword });

    res.status(200).send({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error resetting password",
      error,
    });
  }
};

export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log("Order ID:", orderId);
    console.log("New Status:", status);

    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    console.log("Updated Order:", orders);

    res.json(orders);
  } catch (error) {
    console.error("Error While Updating Order:", error);
    res.status(500).send({
      success: false,
      message: "Error While Updating Order",
      error,
    });
  }
};

