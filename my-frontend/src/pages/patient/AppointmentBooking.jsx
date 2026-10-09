import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/pages/AppointmentBooking.css";

const AppointmentBooking = () => {
  const [formData, setFormData] = useState({
    department: "",
    doctor: "",
    date: "",
    time: "",
    symptoms: "",
    appointment_type: "",
  });

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  // Fetch Departments
  useEffect(() => {
    if (!token) {
      setError("Please login to book an appointment.");
      return;
    }

    axios
      .get("http://127.0.0.1:8000/accounts/departments/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDepartments(res.data))
      .catch(() => setError("Failed to load departments."));
  }, [token]);

  // Fetch Doctors when a department is selected
  useEffect(() => {
    if (!formData.department) {
      setDoctors([]);
      return;
    }

    axios
      .get("http://127.0.0.1:8000/api/doctors/", {
        params: { department: formData.department },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDoctors(res.data))
      .catch(() => setError("Failed to load doctors list."));
  }, [formData.department, token]);

  const appointmentTypes = [
    { value: "checkup", label: "Checkup" },
    { value: "follow_up", label: "Follow Up" },
    { value: "emergency", label: "Emergency" },
    { value: "consultation", label: "Consultation" },
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateFutureDateTime = () => {
    const now = new Date();
    const selected = new Date(`${formData.date}T${formData.time}`);
    return selected > now;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateFutureDateTime()) {
      setError("Please select a future date and time.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://127.0.0.1:8000/api/appointments/",
        {
          doctor: formData.doctor,
          date: formData.date,
          time: formData.time,
          symptoms: formData.symptoms,
          appointment_type: formData.appointment_type,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 201) {
        setSuccess("Appointment booked successfully!");
        setFormData({
          department: "",
          doctor: "",
          date: "",
          time: "",
          symptoms: "",
          appointment_type: "",
        });
        setDoctors([]);
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        Object.values(err.response?.data || {})[0] ||
        "Error booking appointment.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-page">
      <h2>Book an Appointment</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit} className="appointment-form">
        {/* Department */}
        <Form.Group className="mb-3">
          <Form.Label>Select Department</Form.Label>
          <Form.Select
            name="department"
            value={formData.department}
            onChange={(e) => {
              handleChange(e);
              setFormData((prev) => ({ ...prev, doctor: "" }));
            }}
            required
          >
            <option value="">-- Choose a department --</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Doctor */}
        <Form.Group className="mb-3">
          <Form.Label>Select Doctor</Form.Label>
          <Form.Select
            name="doctor"
            value={formData.doctor}
            onChange={handleChange}
            disabled={!formData.department}
            required
          >
            <option value="">-- Choose a doctor --</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                Dr. {doc.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Appointment Type */}
        <Form.Group className="mb-3">
          <Form.Label>Appointment Type</Form.Label>
          <Form.Select
            name="appointment_type"
            value={formData.appointment_type}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Type --</option>
            {appointmentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Date */}
        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Time */}
        <Form.Group className="mb-3">
          <Form.Label>Time</Form.Label>
          <Form.Control
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Symptoms */}
        <Form.Group className="mb-3">
          <Form.Label>Symptoms</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            placeholder="Describe your symptoms..."
            required
          />
        </Form.Group>

        <div className="text-center">
          <Button type="submit" disabled={loading}>
            {loading ? "Booking..." : "Book Appointment"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AppointmentBooking;
