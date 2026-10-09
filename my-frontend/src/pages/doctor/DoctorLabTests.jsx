import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/pages/DoctorDashboard.css";

const DoctorLabTests = () => {
  const [labTests, setLabTests] = useState([]);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/labtests/doctor/lab-tests/",
          { headers: { Authorization: `Bearer ${token}` } }
      );

        setLabTests(res.data);
      } catch (error) {
        console.error("Error fetching doctor lab tests:", error);
      }
    };

    fetchLabTests();
  }, [token]);

  return (
    <div className="doctor-dashboard-container">
      <h2>Assigned Lab Tests</h2>

      {labTests.length > 0 ? (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Test Type</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {labTests.map((test) => (
              <tr key={test.id}>
                <td>
                  {test.patient_detail
                    ? test.patient_detail.username
                    : "Unknown"}
                </td>
                <td>{test.lab_test_detail ? test.lab_test_detail.name : test.test_type}</td>
                <td>{test.date}</td>
                <td>{test.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No lab tests assigned yet.</p>
      )}
    </div>
  );
};

export default DoctorLabTests;
