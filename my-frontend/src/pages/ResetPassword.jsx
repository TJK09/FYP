import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/pages/Resetpassword.css"

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token"); // Token from URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Invalid or missing token.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    // Strong password validation
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setMessage(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/accounts/reset-password/",
        { token, password }
      );

      if (response.status === 200) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/signin"), 3000);
      } else {
        setMessage("Reset failed. The link may be invalid or expired.");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
        "Reset failed. The link may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="text-center mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your new password"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Retype your new password"
          />
        </div>

        <button type="submit" className="btn btn-success w-100" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      {message && <p className="text-center mt-3">{message}</p>}
    </div>
  );
};

export default ResetPassword;
