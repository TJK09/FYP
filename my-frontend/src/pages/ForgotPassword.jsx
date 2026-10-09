import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/pages/forgotpassword.css"

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (!username || !email) {
      setError("Both username and email are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/accounts/forgot-password/",
        { username, email }
      );

      if (response.status === 200) {
        setMessage("Verification successful! Redirecting to reset password...");
        const token = response.data.token;
        setTimeout(() => {
          navigate(`/reset-password?token=${encodeURIComponent(token)}`);
        }, 2000);
      } else {
        setError("Username and email do not match or user does not exist.");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail || "Something went wrong. Try again.");
      } else {
        setError("Network error. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2 className="text-center mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="mb-3">
          <label className="form-label">Enter your username</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Enter your email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your registered email"
          />
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Verifying..." : "Verify and Send Reset Link"}
        </button>
      </form>
      {message && <p className="text-center mt-3 text-success">{message}</p>}
      {error && <p className="text-center mt-3 text-danger">{error}</p>}
    </div>
  );
};

export default ForgotPassword;
