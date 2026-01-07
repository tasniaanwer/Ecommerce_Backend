import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import { response } from "../utils/response.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Stripe with secret key from environment variables
// Make sure to set STRIPE_SECRET_KEY in your .env file
// For testing: Get your secret key from https://dashboard.stripe.com/test/apikeys
// It should start with sk_test_...

// For development/testing, you can use a test secret key
// The publishable key (pk_test_...) is used on frontend, secret key (sk_test_...) is used on backend
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.warn("⚠️  Warning: STRIPE_SECRET_KEY is not set in environment variables.");
  console.warn("   Stripe payments will not work. Please add STRIPE_SECRET_KEY to your .env file.");
  console.warn("   Get your test secret key from: https://dashboard.stripe.com/test/apikeys");
}

const stripe = STRIPE_SECRET_KEY 
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })
  : null;

// Log Stripe initialization status
if (stripe) {
  console.log("✅ Stripe initialized successfully");
} else {
  console.log("❌ Stripe not initialized - STRIPE_SECRET_KEY missing");
}

export const createStripePayment = async (req, res) => {
  try {
    if (!stripe) {
      console.error("Stripe payment attempted but STRIPE_SECRET_KEY is not configured");
      return response(
        res,
        StatusCodes.SERVICE_UNAVAILABLE,
        false,
        {},
        "Stripe payment is not configured. Please set STRIPE_SECRET_KEY in your .env file. Get your test key from https://dashboard.stripe.com/test/apikeys"
      );
    }

    const { amount, cart } = req.body;
    
    // Log request for debugging
    console.log("Stripe payment request:", { 
      amount, 
      cartLength: cart?.length,
      cartItems: cart?.map(item => ({ id: item._id, name: item.name, price: item.price }))
    });

    // Validate amount
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return response(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        {},
        "Invalid amount. Amount must be a positive number."
      );
    }

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    if (amountInCents < 50) {
      return response(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        {},
        "Amount must be at least $0.50"
      );
    }

    // Build line items from cart or use total amount
    let lineItems = [];
    
    if (cart && Array.isArray(cart) && cart.length > 0) {
      // Validate and map cart items
      lineItems = cart
        .filter((item) => item && (item.price || item._id))
        .map((item) => {
          const itemPrice = parseFloat(item.price || 0);
          const itemPriceInCents = Math.round(itemPrice * 100);
          
          if (itemPriceInCents <= 0) {
            console.warn(`Invalid price for item ${item._id || item.name}: ${itemPrice}`);
            return null;
          }
          
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.name || "Product",
                description: item.description ? String(item.description).substring(0, 100) : "",
              },
              unit_amount: itemPriceInCents,
            },
            quantity: 1,
          };
        })
        .filter((item) => item !== null); // Remove invalid items
    }
    
    // If no valid line items, use total amount as single item
    if (lineItems.length === 0) {
      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Order Total",
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ];
    }

    // Validate line items before creating session
    if (!lineItems || lineItems.length === 0) {
      console.error("No valid line items to create Stripe session");
      return response(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        {},
        "No valid items in cart to process payment"
      );
    }

    console.log("Creating Stripe session with line items:", lineItems.length);

    // Prepare metadata - Stripe has 500 character limit per value
    // Store only essential data: product IDs and names
    const metadata = {};
    if (cart && Array.isArray(cart) && cart.length > 0) {
      // Store minimal cart data (only IDs and names) to stay under 500 char limit
      const minimalCart = cart.map(item => ({
        _id: item._id || item.id,
        name: item.name ? item.name.substring(0, 50) : "Product", // Truncate long names
        price: item.price
      }));
      
      const cartJson = JSON.stringify(minimalCart);
      
      // If still too long, store only IDs
      if (cartJson.length > 450) {
        const idsOnly = cart.map(item => item._id || item.id);
        metadata.productIds = JSON.stringify(idsOnly);
        metadata.itemCount = cart.length.toString();
      } else {
        metadata.orderData = cartJson;
      }
    }
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3002"}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3002"}/cart`,
      metadata: metadata,
    });
    
    console.log("Stripe session created successfully:", session.id);

    return response(
      res,
      StatusCodes.CREATED,
      true,
      { sessionId: session.id, url: session.url },
      ""
    );
  } catch (error) {
    console.error("Stripe payment error:", error);
    console.error("Error details:", {
      type: error.type,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      raw: error.raw
    });
    
    // Provide more helpful error messages
    let errorMessage = "Stripe payment failed";
    if (error.type === "StripeInvalidRequestError") {
      errorMessage = `Invalid Stripe request: ${error.message}`;
      if (error.param) {
        errorMessage += ` (Parameter: ${error.param})`;
      }
    } else if (error.type === "StripeAuthenticationError") {
      errorMessage = "Stripe authentication failed. Please check your STRIPE_SECRET_KEY.";
    } else if (error.type === "StripeAPIError") {
      errorMessage = `Stripe API error: ${error.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      false,
      {},
      errorMessage
    );
  }
};

export const stripeWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(503).send("Stripe is not configured");
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    // Handle successful payment
    console.log("Payment successful for session:", session.id);
    // You can update order status here or trigger order confirmation
  }

  res.json({ received: true });
};

export const testStripeConnection = async (req, res) => {
  try {
    if (!stripe) {
      return response(
        res,
        StatusCodes.SERVICE_UNAVAILABLE,
        false,
        {},
        "Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file."
      );
    }

    // Test the connection by retrieving account info
    const account = await stripe.accounts.retrieve();
    
    return response(
      res,
      StatusCodes.OK,
      true,
      { 
        connected: true,
        accountId: account.id,
        message: "Stripe connection successful!"
      },
      "Stripe is properly configured and connected"
    );
  } catch (error) {
    console.error("Stripe connection test error:", error);
    return response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      false,
      {},
      error.message || "Failed to connect to Stripe. Please check your STRIPE_SECRET_KEY."
    );
  }
};

export const verifyStripePayment = async (req, res) => {
  try {
    if (!stripe) {
      return response(
        res,
        StatusCodes.SERVICE_UNAVAILABLE,
        false,
        {},
        "Stripe is not configured"
      );
    }

    const { sessionId } = req.query;

    if (!sessionId) {
      return response(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        {},
        "Session ID is required"
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      return response(
        res,
        StatusCodes.OK,
        true,
        { session, paid: true },
        "Payment verified successfully"
      );
    } else {
      return response(
        res,
        StatusCodes.OK,
        true,
        { session, paid: false },
        "Payment not completed"
      );
    }
  } catch (error) {
    console.log("Stripe verification error:", error);
    return response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      false,
      {},
      error.message || "Failed to verify payment"
    );
  }
};
