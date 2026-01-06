import React, { useState } from "react";
import Layout from "./../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const CartPage = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
  const navigate = useNavigate();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

    try {
      setIsProcessingPayment(true);

      // Calculate numeric amount from cart (in BDT)
      const amount = cart.reduce((total, item) => total + Number(item.price || 0), 0);

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
    } catch (error) {
      console.log(error);
      toast.error("Failed to start bKash payment. Please try again.");
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
                  <h4>Payment</h4>
                  <p>Pay securely with <strong>bKash</strong>.</p>
                  <button
                    className="btn btn-danger"
                    onClick={handlePayment}
                    disabled={isProcessingPayment || !cart?.length}
                  >
                    {isProcessingPayment ? "Processing bKash Payment..." : "Pay with bKash"}
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
