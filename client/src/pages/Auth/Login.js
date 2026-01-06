import React, { useState } from "react";
import Layout from "../../components/Layout/Layout";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/AuthStyles.css";
import { useAuth } from "../../context/auth";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // form function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;

      if (isLogin) {
        // Login logic
        res = await axios.post("/api/v1/auth/login", {
          email,
          password,
        });
        if (res && res.data.success) {
          toast.success(res.data.message);
          setAuth({
            ...auth,
            user: res.data.user,
            token: res.data.token,
          });
          localStorage.setItem("auth", JSON.stringify(res.data));
          navigate(location.state?.from || "/");
        } else {
          toast.error(res.data.message);
        }
      } else {
        // Register logic
        res = await axios.post("/api/v1/auth/register", {
          name,
          email,
          password,
          phone,
          address,
          answer,
        });
        if (res && res.data.success) {
          toast.success(res.data.message);
          // Switch to login mode after successful registration
          setIsLogin(true);
          // Clear form fields except email
          setPassword("");
          setName("");
          setPhone("");
          setAddress("");
          setAnswer("");
        } else {
          toast.error(res.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login and register
  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Clear form fields when switching
    setPassword("");
    setName("");
    setPhone("");
    setAddress("");
    setAnswer("");
  };

  return (
    <Layout title={isLogin ? "Login - Ecommerce App" : "Register - Ecommerce App"}>
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? "Sign in to access your tech account"
              : "Join TechHub and explore latest gadgets"
            }
          </p>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input"
                  placeholder="Enter your full name"
                  required
                  autoFocus={!isLogin}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="Enter your email"
                required
                autoFocus={isLogin}
                autoComplete={isLogin ? "email" : "email"}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                placeholder={isLogin ? "Enter your password" : "Create a password (min 3 characters)"}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="auth-input"
                    placeholder="Enter your phone number"
                    required
                    autoComplete="tel"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="auth-input"
                    placeholder="Enter your address"
                    required
                    autoComplete="street-address"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Security Question</label>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="auth-input"
                    placeholder="What is your favorite tech brand?"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className={`auth-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading
                ? (isLogin ? 'Signing In...' : 'Creating Account...')
                : (isLogin ? 'Sign In' : 'Create Account')
              }
            </button>

            {isLogin && (
              <button
                type="button"
                className="auth-btn auth-btn-secondary"
                onClick={() => {
                  navigate("/forgot-password");
                }}
              >
                Forgot Password?
              </button>
            )}
          </form>

          <div className="auth-divider">
            <span>{isLogin ? "New to our store?" : "Already have an account?"}</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              className="auth-link"
              onClick={toggleMode}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? "Create an account" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
