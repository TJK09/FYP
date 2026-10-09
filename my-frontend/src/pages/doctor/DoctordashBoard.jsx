import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/pages/DoctorDashboard.css";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const token = localStorage.getItem("access_token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
  if (!token) {
    navigate("/login");
    return;
  }

  const fetchData = async () => {
    try {
      const doctorRes = await axios.get(
        "http://127.0.0.1:8000/accounts/user/me/",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDoctor(doctorRes.data);

      const apptRes = await axios.get(
        `http://127.0.0.1:8000/api/appointments/?doctor_id=${doctorRes.data.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments(apptRes.data);
    } catch (error) {
      console.error("Error loading doctor data:", error);
    }
  };

  fetchData();
}, []);     // 🚀 NO DEPENDENCIES → NO MORE INFINITE LOOPS


  const handleBookLabTest = () => navigate("/doctor/add-record");
  const handleViewRecords = () => navigate("/doctor/Records");
  const handleDepressionTest = () => navigate("/Depression");

  return (
    <div className="doctor-dashboard-container">
      <h2 className="dashboard-title">Doctor Dashboard</h2>

      {doctor ? (
        <div className="doctor-info">
          <h4>Welcome Dr. {doctor.username}</h4>
          <p><strong>Email:</strong> {doctor.email}</p>
          <p><strong>Role:</strong> {doctor.role}</p>
        </div>
      ) : (
        <p>Loading doctor information...</p>
      )}

      <div className="dashboard-section">
        <h3>Upcoming Appointments</h3>
        {appointments.length > 0 ? (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id}>
                  <td>{appt.patient_name}</td>
                  <td>{appt.date}</td>
                  <td>{appt.time}</td>
                  <td>{appt.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No upcoming appointments.</p>
        )}
      </div>

      <div className="dashboard-actions">
        <button className="btn btn-primary" onClick={handleBookLabTest}>
          Add Prescription
        </button>
        <button className="btn btn-success" onClick={handleViewRecords}>
          View Medical Records
        </button>
        <button className="btn btn-warning" onClick={handleDepressionTest}>
          Depression Analysis Test
        </button>
      </div>
    </div>
  );
};

export default DoctorDashboard;
