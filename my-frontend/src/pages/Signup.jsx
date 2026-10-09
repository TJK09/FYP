import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';
import "../styles/pages/signup.css";


const API_URL = "http://20.207.197.244:8000/";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    contact_number: "",
    username: "",
    email: "",
    password: "",
    retypePassword: "",
    role: "patient",
    department: "", // new field for doctors
  });

  const [error, setError] = useState("");
  const [departments, setDepartments] = useState([]);

  // Fetch departments from backend
  useEffect(() => {
    axios.get(API_URL + "accounts/departments/")
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error("Failed to load departments:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, contact_number: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // First & Last Name validation
    const nameRegex = /^[A-Za-z]{2,}$/;
    if (!nameRegex.test(formData.first_name)) {
      setError("First name must be at least 2 letters and contain only alphabets.");
      return;
    }
    if (!nameRegex.test(formData.last_name)) {
      setError("Last name must be at least 2 letters and contain only alphabets.");
      return;
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9._]{3,19}$/;
    if (!usernameRegex.test(formData.username)) {
      setError(
        "Username must start with a letter, be 4-20 characters long, and can include letters, numbers, dots, or underscores."
      );
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Enter a valid email address.");
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must be at least 8 characters, including 1 uppercase letter, 1 lowercase, 1 number, and 1 special character."
      );
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.retypePassword) {
      setError("Passwords do not match.");
      return;
    }

    // Doctor-specific validation
    if (formData.role === "doctor" && !formData.department) {
      setError("Please select a department for doctor.");
      return;
    }

    try {
      const payload = { ...formData };
      if (formData.role !== "doctor") delete payload.department; // remove if not doctor
      // For doctor, department is already the ID

      const response = await axios.post(
        API_URL + "accounts/user/register/",
        payload
      );

      if (response.status === 201 || response.data?.message) {
        alert("User registered successfully! Please verify your email.");
        navigate("/emailverification");
      } else {
        setError("Registration failed: Unexpected response from server.");
      }
    } catch (err) {
      if (err.response) {
        const errData = err.response.data;
        setError(
          errData.detail ||
            errData.message ||
            (typeof errData === "string" ? errData : JSON.stringify(errData)) ||
            "Registration failed."
        );
      } else {
        setError("Network or server error. Please try again later.");
      }
    }
  };

  return (
    <div className="signup-page">
      <h2>Register</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="first_name"
          placeholder="Enter first name"
          value={formData.first_name}
          onChange={handleChange}
          required
          autoFocus
        />

        <input
          type="text"
          name="last_name"
          placeholder="Enter last name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />

        <PhoneInput
          country={'us'}
          value={formData.contact_number}
          onChange={handlePhoneChange}
          inputProps={{
            name: "contact_number",
            required: true,
          }}
        />

        <input
          type="text"
          name="username"
          placeholder="Enter username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
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

        <input
          type="password"
          name="retypePassword"
          placeholder="Retype password"
          value={formData.retypePassword}
          onChange={handleChange}
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>

        {/* Only show department if role is doctor */}
        {formData.role === "doctor" && (
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Department --</option>
            {departments.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.name}
              </option>
            ))}
          </select>
        )}

        <button type="submit">Register</button>
      </form>

      <div className="signup-option">
        <p>
          Already have an account?{" "}
          <span
            className="signup-link"
            onClick={() => navigate("/login")}
            style={{ cursor: "pointer" }}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
