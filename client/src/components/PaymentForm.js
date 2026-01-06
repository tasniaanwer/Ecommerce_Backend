import React, { useState } from 'react';
//import "./PaymentForm.css"; // Import the CSS file

const PaymentForm = ({ onPayment }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the form from actually submitting
  
    const cardNumber = document.getElementById('cardNumber').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvc = document.getElementById('cvc').value;
  
    if (!validateCardNumber(cardNumber) || !validateExpiryDate(expiryDate) || !validateCVC(cvc)) {
      alert('Please check your input and try again.');
      return;
    }
  
    setIsSubmitted(true); // Set isSubmitted to true to show the payment success message
    onPayment(); // Trigger the payment process
  };
  
  // Validation functions
  function validateCardNumber(number) {
    return /^\d{4} \d{4} \d{4} \d{4}$/.test(number);
  }
  
  function validateExpiryDate(date) {
    return /^(0[1-9]|1[0-2])\/\d{2}$/.test(date);
  }
  
  function validateCVC(cvc) {
    return /^\d{3}$/.test(cvc);
  }
  
  return (
    <div className="payment-container">
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="payment-form">
          <h2>Secure Payment</h2>
          <div className="form-group">
            <label htmlFor="cardNumber">Card Number</label>
            <input 
              type="text" 
              id="cardNumber" 
              placeholder="1234 5678 9012 3456"
              pattern="\d{4} \d{4} \d{4} \d{4}" 
              required
              title="Card number must be 16 digits (e.g., 1234 5678 9012 3456)" 
            />
          </div>
          <div className="form-group half-width">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input 
              type="text" 
              id="expiryDate" 
              placeholder="MM/YY"
              pattern="(0[1-9]|1[0-2])\/[0-9]{2}" 
              required
              title="Expiry date must be in MM/YY format" 
            />
          </div>
          <div className="form-group half-width">
            <label htmlFor="cvc">CVC</label>
            <input 
              type="text" 
              id="cvc" 
              placeholder="CVC"
              pattern="\d{3}" 
              required
              title="CVC must be 3 digits" 
            />
          </div>
          <button type="submit" className="submit-btn">Submit Payment</button>
        </form>
      ) : (
        <div className="payment-success">
          <h2>Payment Successful!</h2>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
