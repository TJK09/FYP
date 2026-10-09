import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/pages/Signin.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/accounts/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Friendly check for email verification error
        if (data.non_field_errors && data.non_field_errors[0].includes("Email not verified")) {
          setError("Email not verified. Please check your inbox and verify your email.");
        } else {
          setError(data.detail || data.non_field_errors?.[0] || "Invalid credentials");
        }
        return;
      }

      // Save JWT
      if (formData.rememberMe) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
      } else {
        sessionStorage.setItem("access_token", data.access);
        sessionStorage.setItem("refresh_token", data.refresh);
      }

      // Get current user
      const userRes = await fetch("http://127.0.0.1:8000/accounts/user/me/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.access}`,
        },
      });

      const userData = await userRes.json();

      if (!userData.role) {
        setError("User role missing. Something is wrong on backend.");
        return;
      }

      localStorage.setItem("role", userData.role.toLowerCase());
      localStorage.setItem("user", JSON.stringify(userData));

      // Redirect by role
      if (userData.role === "doctor") navigate("/dashboard/doctor");
      else if (userData.role === "patient") navigate("/dashboard/patient");
      else if (userData.role === "admin") navigate("/dashboard/admin");
      else setError("Unknown role.");

    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please make sure your backend is running and CORS is allowed.");
    }
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Enter username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div className="remember-forgot">
          <label className="remember-me">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            Remember Me
          </label>

          <Link to="/forgot-password" className="forgot-link">
            Forgot Password?
          </Link>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Login</button>

        <div className="register-option">
          <p>
            New user?{" "}
            <Link to="/signup" className="register-link">
              Register here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
