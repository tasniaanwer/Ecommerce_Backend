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
  const [isConfirming, setIsConfirming] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentInfo, setPaymentInfo] = useState({
    mobileNumber: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
  });

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
    // Basic validation for payment selection and required fields
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (paymentMethod === "mobileBanking") {
      if (!paymentInfo.mobileNumber.trim()) {
        toast.error("Please enter your mobile number");
        return;
      }
    }

    if (paymentMethod === "card") {
      if (
        !paymentInfo.cardNumber.trim() ||
        !paymentInfo.cardExpiry.trim() ||
        !paymentInfo.cardCVC.trim()
      ) {
        toast.error("Please fill in all card details");
        return;
      }
    }

    // For now we just confirm the order after "payment" validation
    await handleOrderConfirmation();
  };

  const handleOrderConfirmation = async () => {
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

    // Confirm order with user
    const confirmOrder = window.confirm(
      `Confirm your order:\n\n` +
      `Items: ${cart.length} products\n` +
      `Total Cost: ৳${totalPrice().replace(/[^0-9]/g, '')}\n` +
      `Delivery Address: ${auth.user.address}\n\n` +
      `Click OK to confirm your order for shipment.`
    );

    if (!confirmOrder) return;

    setIsConfirming(true);

    try {
      const orderData = {
        cart,
        // No payment info - simple order confirmation
      };
      const response = await axios.post("/api/v1/product/confirm-order", orderData);
      if (response.data.success) {
        toast.success("🎉 Order confirmed successfully! Your items will be shipped to your address.");
        // Clear cart
        setCart([]);
        // Clear user-specific cart from localStorage
        if (auth?.user?._id) {
          const userCartKey = `cart_${auth.user._id}`;
          localStorage.removeItem(userCartKey);
        }
        // Redirect based on user role
        if (auth?.user?.role === "admin") {
          navigate("/dashboard/admin/orders");
        } else {
          navigate("/dashboard/user/orders");
        }
      } else {
        toast.error("Failed to confirm order. Please try again.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to confirm order. Please try again.");
    } finally {
      setIsConfirming(false);
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
                <div>
                  <h4>Choose Payment Method</h4>
                  <div className="mb-2">
                    <input
                      type="radio"
                      id="mobileBanking"
                      name="paymentMethod"
                      value="mobileBanking"
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="mobileBanking">Mobile Banking</label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="radio"
                      id="card"
                      name="paymentMethod"
                      value="card"
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="card">Card</label>
                  </div>
                </div>
                {paymentMethod === "mobileBanking" && (
                  <div className="mb-3">
                    <label>Mobile Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={paymentInfo.mobileNumber}
                      onChange={(e) =>
                        setPaymentInfo({ ...paymentInfo, mobileNumber: e.target.value })
                      }
                    />
                  </div>
                )}
                {paymentMethod === "card" && (
                  <>
                    <div className="mb-3">
                      <label>Card Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={paymentInfo.cardNumber}
                        onChange={(e) =>
                          setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label>Card Expiry</label>
                      <input
                        type="text"
                        className="form-control"
                        value={paymentInfo.cardExpiry}
                        onChange={(e) =>
                          setPaymentInfo({ ...paymentInfo, cardExpiry: e.target.value })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label>Card CVC</label>
                      <input
                        type="text"
                        className="form-control"
                        value={paymentInfo.cardCVC}
                        onChange={(e) =>
                          setPaymentInfo({ ...paymentInfo, cardCVC: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}
                <button className="btn btn-primary" onClick={handlePayment}>
                  Proceed to Payment
                </button>
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
