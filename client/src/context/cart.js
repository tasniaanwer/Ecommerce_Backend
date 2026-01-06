import { useState, useContext, createContext, useEffect } from "react";
import { useAuth } from "./auth";

const CartContext = createContext();
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [auth] = useAuth();

  // Get user-specific cart key
  const getUserCartKey = (userId) => {
    return userId ? `cart_${userId}` : "cart_guest";
  };

  // Load user-specific cart when auth changes
  useEffect(() => {
    if (auth?.user?._id) {
      // User is logged in, load their cart
      const userCartKey = getUserCartKey(auth.user._id);
      let existingCartItem = localStorage.getItem(userCartKey);

      // Check if there's old cart data to migrate
      const oldCartData = localStorage.getItem("cart");
      if (!existingCartItem && oldCartData) {
        // Migrate old cart data to new user-specific format
        localStorage.setItem(userCartKey, oldCartData);
        localStorage.removeItem("cart"); // Clean up old data
        setCart(JSON.parse(oldCartData));
      } else if (existingCartItem) {
        setCart(JSON.parse(existingCartItem));
      } else {
        setCart([]); // No existing cart for this user
      }
    } else {
      // User is not logged in, clear cart
      setCart([]);
    }
  }, [auth?.user?._id]);

  // Custom setCart function that also updates localStorage
  const setUserCart = (newCart) => {
    setCart(newCart);

    // Save to user-specific localStorage if user is logged in
    if (auth?.user?._id) {
      const userCartKey = getUserCartKey(auth.user._id);
      localStorage.setItem(userCartKey, JSON.stringify(newCart));
    }
  };

  return (
    <CartContext.Provider value={[cart, setUserCart]}>
      {children}
    </CartContext.Provider>
  );
};

// custom hook
const useCart = () => useContext(CartContext);

export { useCart, CartProvider };