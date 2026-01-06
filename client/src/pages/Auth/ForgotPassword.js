import React, { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/ForgotPasswordStyles.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [answer, setAnswer] = useState("");
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", "", ""]);
  const [securityQuestions, setSecurityQuestions] = useState([
    { question: "What is your favorite sport?", type: "sport" },
    { question: "What was your first pet's name?", type: "pet" },
    { question: "What city were you born in?", type: "city" }
  ]);
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [timer, setTimer] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const inputRefs = useRef([]);

  // Timer for resend code
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle verification code input
  const handleCodeInput = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Move to next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace in verification code
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Send verification code
  const sendVerificationCode = async (method) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/v1/auth/send-verification", {
        [method === 'email' ? 'email' : 'phone']: method === 'email' ? email : phone,
        method
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setTimer(60); // 60 seconds timer
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  // Recovery methods
  const recoveryMethods = [
    {
      id: 'email',
      icon: '📧',
      title: 'Email',
      description: 'Get reset link via email',
      requiresEmail: true
    },
    {
      id: 'phone',
      icon: '📱',
      title: 'Phone',
      description: 'Get code via SMS',
      requiresPhone: true
    },
    {
      id: 'security',
      icon: '🔐',
      title: 'Security Questions',
      description: 'Answer security questions',
      requiresSecurityQuestion: true
    }
  ];

  // Step 1: Select recovery method
  const handleMethodSelection = (methodId) => {
    setSelectedMethod(methodId);
    setCurrentStep(2);
  };

  // Step 2: Handle verification
  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let verificationData = {
        email
      };

      if (selectedMethod === 'email') {
        verificationData.newPassword = newPassword;
        verificationData.answer = answer;
      } else if (selectedMethod === 'phone') {
        verificationData.phone = phone;
        verificationData.verificationCode = verificationCode.join('');
      } else if (selectedMethod === 'security') {
        verificationData.answer = answer;
        verificationData.newPassword = newPassword;
      }

      const endpoint = selectedMethod === 'email'
        ? "/api/v1/auth/forgot-password"
        : "/api/v1/auth/verify-reset";

      const res = await axios.post(endpoint, verificationData);

      if (res.data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Progress steps
  const progressSteps = [
    { id: 1, label: 'Choose Method' },
    { id: 2, label: 'Verify Identity' },
    { id: 3, label: 'Reset Password' }
  ];

  // Reset form
  const resetForm = () => {
    setCurrentStep(1);
    setSelectedMethod("");
    setEmail("");
    setPhone("");
    setNewPassword("");
    setConfirmPassword("");
    setAnswer("");
    setVerificationCode(["", "", "", "", "", ""]);
    setTimer(0);
    setShowSuccess(false);
  };

  return (
    <Layout title="Forgot Password - BookVerse">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          {/* Back Button */}
          {currentStep > 1 && !showSuccess && (
            <button className="back-button" onClick={() => setCurrentStep(currentStep - 1)}>
              ← Back
            </button>
          )}

          {/* Success State */}
          {showSuccess ? (
            <div style={{ textAlign: 'center' }}>
              <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
              <h2 className="forgot-password-title">Password Reset Successful!</h2>
              <p className="forgot-password-subtitle">
                Your password has been updated successfully. You will be redirected to login page.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="forgot-password-header">
                <div className="forgot-password-icon">🔐</div>
                <h1 className="forgot-password-title">Forgot Password?</h1>
                <p className="forgot-password-subtitle">
                  Don't worry, it happens to the best of us. Choose a recovery method to access your TechHub account.
                </p>
              </div>

              {/* Progress Steps */}
              {currentStep > 1 && (
                <div className="progress-steps">
                  {progressSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`progress-step ${
                        currentStep > index ? 'completed' :
                        currentStep === index + 1 ? 'active' : ''
                      }`}
                    >
                      <div className="progress-step-number">
                        {currentStep > index ? '✓' : index + 1}
                      </div>
                      <span className="progress-step-label">{step.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 1: Choose Recovery Method */}
              {currentStep === 1 && (
                <div className="form-section active">
                  <div className="recovery-methods-grid">
                    {recoveryMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`recovery-method-card ${
                          selectedMethod === method.id ? 'selected' : ''
                        }`}
                        onClick={() => handleMethodSelection(method.id)}
                      >
                        <span className="recovery-method-icon">{method.icon}</span>
                        <div className="recovery-method-title">{method.title}</div>
                        <div className="recovery-method-description">{method.description}</div>
                      </div>
                    ))}
                  </div>

                  <div className="help-section">
                    <h3 className="help-title">Need Help?</h3>
                    <p className="help-text">
                      Can't access any of your recovery options? Contact our support team for assistance.
                    </p>
                    <div className="contact-options">
                      <a href="mailto:support@bookverse.com" className="contact-option">
                        📧 support@bookverse.com
                      </a>
                      <a href="tel:+18001234567" className="contact-option">
                        📞 1-800-123-4567
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Verification Form */}
              {currentStep === 2 && (
                <form onSubmit={handleVerification} className="form-section active">
                  {selectedMethod === 'email' && (
                    <>
                      <input
                        type="email"
                        className="forgot-input"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />

                      <div className="security-question">
                        <div className="security-question-text">
                          {securityQuestions[selectedQuestion].question}
                        </div>
                        <input
                          type="text"
                          className="forgot-input"
                          placeholder="Your answer"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          required
                          style={{ marginTop: '12px', background: 'white' }}
                        />
                      </div>

                      <input
                        type="password"
                        className="forgot-input"
                        placeholder="New password (min 3 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={3}
                      />

                      <input
                        type="password"
                        className="forgot-input"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={3}
                      />

                      {confirmPassword && newPassword !== confirmPassword && (
                        <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '-16px', marginBottom: '16px' }}>
                          Passwords do not match
                        </div>
                      )}

                      <button type="submit" className="forgot-btn" disabled={loading || newPassword !== confirmPassword}>
                        {loading ? <span className="loading-spinner"></span> : ''}
                        Reset Password
                      </button>
                    </>
                  )}

                  {selectedMethod === 'phone' && (
                    <>
                      <input
                        type="tel"
                        className="forgot-input"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />

                      <button
                        type="button"
                        className="forgot-btn forgot-btn-outline"
                        onClick={() => sendVerificationCode('phone')}
                        disabled={loading || timer > 0}
                      >
                        {loading ? <span className="loading-spinner"></span> : ''}
                        Send Verification Code
                        {timer > 0 && ` (${timer}s)`}
                      </button>

                      {timer > 0 && (
                        <div className="verification-code-container">
                          {verificationCode.map((digit, index) => (
                            <input
                              key={index}
                              ref={(el) => (inputRefs.current[index] = el)}
                              type="text"
                              className={`verification-code-input ${digit ? 'filled' : ''}`}
                              maxLength="1"
                              value={digit}
                              onChange={(e) => handleCodeInput(index, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(index, e)}
                              required
                            />
                          ))}
                        </div>
                      )}

                      <input
                        type="password"
                        className="forgot-input"
                        placeholder="New password (min 3 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={3}
                      />

                      <button type="submit" className="forgot-btn" disabled={loading || verificationCode.join('').length !== 6}>
                        {loading ? <span className="loading-spinner"></span> : ''}
                        Verify & Reset Password
                      </button>
                    </>
                  )}

                  {selectedMethod === 'security' && (
                    <>
                      <div className="security-question">
                        <div className="security-question-text">
                          {securityQuestions[selectedQuestion].question}
                        </div>
                        <input
                          type="text"
                          className="forgot-input"
                          placeholder="Your answer"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          required
                          style={{ marginTop: '12px', background: 'white' }}
                        />
                      </div>

                      <input
                        type="password"
                        className="forgot-input"
                        placeholder="New password (min 3 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={3}
                      />

                      <input
                        type="password"
                        className="forgot-input"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={3}
                      />

                      {confirmPassword && newPassword !== confirmPassword && (
                        <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '-16px', marginBottom: '16px' }}>
                          Passwords do not match
                        </div>
                      )}

                      <button type="submit" className="forgot-btn" disabled={loading || newPassword !== confirmPassword}>
                        {loading ? <span className="loading-spinner"></span> : ''}
                        Verify & Reset Password
                      </button>
                    </>
                  )}

                  <div className="resend-timer">
                    Remember your password?{' '}
                    <span className="resend-link" onClick={() => navigate("/login")}>
                      Back to Login
                    </span>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;