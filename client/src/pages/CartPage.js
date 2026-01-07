import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const CartPage = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bkash"); // Default to bkash

  // Check if returning from successful payment and clear cart
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const sessionId = searchParams.get("session_id");
      
      if (sessionId && auth?.token) {
        try {
          // Verify if payment was successful
          const verifyResponse = await axios.get(`/api/stripe/verify?sessionId=${sessionId}`);
          
          if (verifyResponse.data.data?.paid) {
            // Payment was successful - clear cart
            setCart([]);
            if (auth?.user?._id) {
              const userCartKey = `cart_${auth.user._id}`;
              localStorage.removeItem(userCartKey);
              localStorage.removeItem("cart");
            }
            toast.success("Payment successful! Your cart has been cleared.");
            // Remove query params to clean URL
            navigate("/cart", { replace: true });
          }
        } catch (error) {
          console.log("Payment verification check failed:", error);
        }
      }
    };

    checkPaymentStatus();
  }, [searchParams, auth, setCart, navigate]);

  const totalPrice = () => {
    try {
      let total = 0;
      cart?.map((item) => {
        total += item.price;
      });
      return total.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const removeCartItem = (pid) => {
    try {
      let myCart = [...cart];
      let index = myCart.findIndex((item) => item._id === pid);
      myCart.splice(index, 1);
      setCart(myCart);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePayment = async () => {
    // Check if user is authenticated
    if (!auth?.token) {
      toast.error("Please login to complete your order", {
        duration: 3000,
        position: "top-center"
      });
      navigate("/login", {
        state: { from: "/cart" }
      });
      return;
    }

    // Check if user has address
    if (!auth?.user?.address) {
      toast.error("Please update your profile address to complete order", {
        duration: 3000,
        position: "top-center"
      });
      navigate("/dashboard/user/profile");
      return;
    }
    if (!cart?.length) {
      toast.error("Your cart is empty");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      setIsProcessingPayment(true);

      // Calculate numeric amount from cart
      const amount = cart.reduce((total, item) => total + Number(item.price || 0), 0);

      if (paymentMethod === "bkash") {
        // Handle bKash payment
        const response = await axios.post("/api/bkash/create", {
          amount: amount.toString(),
        });

        const bkashURL = response?.data?.data?.data?.bkashURL;

        if (bkashURL) {
          // Redirect user to bKash payment gateway
          window.location.href = bkashURL;
        } else {
          toast.error("Unable to initiate bKash payment. Please try again.");
        }
      } else if (paymentMethod === "stripe") {
        // Handle Stripe payment - redirect to Stripe checkout page
        // User will enter card information on Stripe's page
        const response = await axios.post("/api/stripe/create", {
          amount: amount.toString(),
          cart: cart,
        });

        const stripeURL = response?.data?.data?.url;

        if (stripeURL) {
          // Redirect user to Stripe Checkout page (where they enter card info)
          window.location.href = stripeURL;
        } else {
          toast.error("Unable to initiate Stripe payment. Please try again.");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      let errorMessage = paymentMethod === "bkash" 
        ? "Failed to start bKash payment. Please try again."
        : "Failed to start Stripe payment. Please try again.";
      
      // Show actual error message from server if available
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <Layout>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-light p-2 mb-1">
              {`Hello ${auth?.token && auth?.user?.name}`}
            </h1>
            <h4 className="text-center">
              {cart?.length
                ? `You Have ${cart.length} items in your cart ${
                    auth?.token ? "" : "please login to checkout"
                  }`
                : " Your Cart Is Empty"}
            </h4>
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">
            {cart?.map((p) => (
              <div className="row mb-2 p-3 card flex-row" key={p._id}>
                <div className="col-md-4">
                  <img
                    src={`/api/v1/product/product-photo/${p._id}`}
                    className="card-img-top"
                    alt={p.name}
                    width="100px"
                    height={"100px"}
                  />
                </div>
                <div className="col-md-8">
                  <p>{p.name}</p>
                  <p>{p.description.substring(0, 30)}</p>
                  <p>Price : {p.price}</p>
                  <button
                    className="btn btn-danger"
                    onClick={() => removeCartItem(p._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="col-md-4 text-center">
            <h2>Cart Summary</h2>
            <p>Total | Checkout | Payment</p>
            <hr />
            <h4>Total: {totalPrice()}</h4>
            {auth?.user?.address ? (
              <>
                <div className="mb-3">
                  <h4>Current Address</h4>
                  <h5>{auth?.user?.address}</h5>
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => navigate("/dashboard/user/profile")}
                  >
                    Update Address
                  </button>
                </div>
                <div className="mt-3">
                  <h4>Choose Payment Method</h4>
                  <div className="mb-3">
                    <div className="mb-2">
                      <input
                        type="radio"
                        id="bkash"
                        name="paymentMethod"
                        value="bkash"
                        checked={paymentMethod === "bkash"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label htmlFor="bkash" className="ms-2">bKash</label>
                    </div>
                    <div className="mb-2">
                      <input
                        type="radio"
                        id="stripe"
                        name="paymentMethod"
                        value="stripe"
                        checked={paymentMethod === "stripe"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label htmlFor="stripe" className="ms-2">Stripe (Card)</label>
                    </div>
                  </div>
                  <button
                    className={`btn ${paymentMethod === "bkash" ? "btn-danger" : "btn-primary"}`}
                    onClick={handlePayment}
                    disabled={isProcessingPayment || !cart?.length}
                  >
                    {isProcessingPayment 
                      ? `Processing ${paymentMethod === "bkash" ? "bKash" : "Stripe"} Payment...` 
                      : `Pay with ${paymentMethod === "bkash" ? "bKash" : "Stripe"}`}
                  </button>
                </div>
              </>
            ) : (
              <button
                className="btn btn-outline-warning"
                onClick={() =>
                  navigate("/login", {
                    state: "/cart",
                  })
                }
              >
                Please login to checkout
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
