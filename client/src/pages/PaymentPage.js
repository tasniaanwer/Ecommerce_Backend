import React, { useState } from "react";
import PaymentForm from "./../components/PaymentForm";
import "./PaymentPage.css"; // Import CSS for styling

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate payment success action, e.g., redirecting or showing success message
    }, 2000); // Simulate a delay for payment processing
  };

  return (
    <div className="payment-page-container">
      <div className="payment-container">
        <PaymentForm onPayment={handlePayment} />
      </div>
    </div>
  );
};

export default PaymentPage;
