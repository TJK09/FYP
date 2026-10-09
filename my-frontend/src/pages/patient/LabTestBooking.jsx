import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/pages/LabTestBooking.css";

const LabTestBooking = () => {
  const [formData, setFormData] = useState({
    lab_test: "",       
    doctor_username: "",
    date: "",
    time: "",
  });
  const [message, setMessage] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [mlToken, setMlToken] = useState(localStorage.getItem("ml_token") || null);

  const accessToken = localStorage.getItem("access_token");

  // Fetch doctors and lab tests
  useEffect(() => {
    if (!accessToken) return;

    const fetchDoctors = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/labtests/doctors/",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setDoctors(res.data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };

    const fetchLabTests = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/labtests/tests/");
        setLabTests(res.data);
      } catch (err) {
        console.error("Error fetching lab tests:", err);
      }
    };

    fetchDoctors();
    fetchLabTests();
  }, [accessToken]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMlToken(null);

    if (!accessToken) {
      setMessage("❌ You must be logged in to book a test.");
      return;
    }

    try {
      const payload = {
        lab_test: parseInt(formData.lab_test),
        doctor_username: formData.doctor_username,
        date: formData.date,
        time: formData.time.length === 5 ? `${formData.time}:00` : formData.time,
      };

      const res = await axios.post(
        "http://127.0.0.1:8000/api/labtests/book/",
        payload,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (res.status === 201) {
        const bookedTest = res.data;
        setMessage("✅ Lab test booked successfully!");

        // Save ML token in localStorage if returned
        if (bookedTest.access_token) {
          setMlToken(bookedTest.access_token);
          localStorage.setItem("ml_token", bookedTest.access_token);
        }

        setFormData({ lab_test: "", doctor_username: "", date: "", time: "" });
      }
    } catch (err) {
      console.error("Booking error:", err.response?.data || err.message);
      if (err.response?.data?.detail)
        setMessage(`❌ ${err.response.data.detail}`);
      else if (err.response?.data)
        setMessage(`❌ ${JSON.stringify(err.response.data)}`);
      else
        setMessage("❌ Failed to book test. Please try again.");
    }
  };

  return (
    <div className="labtest-page">
      <h2>Book a Lab Test</h2>

      {message && (
        <p className={message.startsWith("✅") ? "text-success" : "text-danger"}>
          {message}
        </p>
      )}

      {mlToken && (
        <div className="alert alert-info">
          🔑 Your ML access token: <strong>{mlToken}</strong>
          <br />Use this token to access your ML test results.
        </div>
      )}

      <form onSubmit={handleSubmit} className="labtest-form">
        <div className="mb-3">
          <label className="form-label">Select Lab Test:</label>
          <select
            name="lab_test"
            value={formData.lab_test}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Lab Test --</option>
            {labTests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.name} {test.ml_required ? "(ML Test)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Select Doctor:</label>
          <select
            name="doctor_username"
            value={formData.doctor_username}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Doctor --</option>
            {doctors.map((doc) => (
              <option key={doc.username} value={doc.username}>
                {doc.first_name} {doc.last_name} ({doc.username})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Time:</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Book Test</button>
      </form>
    </div>
  );
};

export default LabTestBooking;
