import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/pages/PatientDashboard.css";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [progressReports, setProgressReports] = useState([]);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
  try {
    // Fetch patient info
    const patientRes = await axios.get(
      "http://127.0.0.1:8000/accounts/user/me/",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPatient(patientRes.data);

    // Fetch upcoming appointments
    const apptRes = await axios.get(
      `http://127.0.0.1:8000/api/appointments/?patient_id=${patientRes.data.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setAppointments(apptRes.data);

    // Fetch medical records
    const recordsRes = await axios.get(
      `http://127.0.0.1:8000/api/records/?patient_id=${patientRes.data.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setProgressReports(recordsRes.data);
  } catch (error) {
    console.error("Error loading patient data:", error);
  }
};


    fetchData();
  }, []);

  const handleBookAppointment = () => navigate("/appointment");
  const handleViewReports = () => navigate("/medical-records");
  const handleViewLabReports = () => navigate("/lab-test");
  const handleDepressionTest = () => navigate("/Depression");
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="patient-dashboard-container">
      <h2 className="dashboard-title">Patient Dashboard</h2>

      {patient ? (
        <div className="patient-info">
          <h4>Welcome, {patient.username}</h4>
          <p><strong>Name:</strong> {patient.first_name} {patient.last_name}</p>
          <p><strong>Email:</strong> {patient.email}</p>
          <p><strong>Username:</strong> {patient.username}</p>
          <button className="btn btn-danger mt-2" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <p>Loading patient information...</p>
      )}

      <div className="dashboard-section mt-4">
        <h3>Upcoming Appointments</h3>
        {appointments.length > 0 ? (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id}>
                  <td>{appt.doctor_name}</td>
                  <td>{appt.date}</td>
                  <td>{appt.time}</td>
                  <td>{appt.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No upcoming appointments.</p>
        )}
      </div>

      <div className="dashboard-section mt-4">
        <h3>Progress & Medical Reports</h3>
        {progressReports.length > 0 ? (
          <table className="reports-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Report</th>
                <th>Date</th>
                <th>View / Download</th>
              </tr>
            </thead>
            <tbody>
              {progressReports.map((report, idx) => (
                <tr key={report.id}>
                  <td>{idx + 1}</td>
                  <td>{report.title}</td>
                  <td>{report.date}</td>
                  <td>
                    <a
                      href={`http://127.0.0.1:8000${report.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success btn-sm"
                    >
                      View / Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No reports available.</p>
        )}
      </div>

      <div className="dashboard-actions mt-4">
        <button className="btn btn-primary me-2" onClick={handleBookAppointment}>
          Book Appointment
        </button>
        <button className="btn btn-secondary me-2" onClick={handleViewLabReports}>
          Book Lab Tests
        </button>
        <button className="btn btn-info me-2" onClick={handleViewReports}>
          Medical Records
        </button>
        <button className="btn btn-warning" onClick={handleDepressionTest}>
          Mental Health Check
        </button>
      </div>
    </div>
  );
};

export default PatientDashboard;
