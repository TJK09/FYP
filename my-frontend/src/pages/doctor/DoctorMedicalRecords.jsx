import React, { useEffect, useState } from "react";
import axios from "axios";

const DoctorMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/medicalrecord/records/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRecords(res.data);
      } catch (err) {
        console.error("Error fetching doctor records:", err);
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, [token]);

  if (!user || user.role !== "doctor") {
    return <p>You are not authorized to view this page.</p>;
  }

  const downloadPDF = async (recordId) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/medicalrecord/records/${recordId}/pdf/`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `LabReport_${recordId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("PDF DOWNLOAD ERROR:", err);
      alert("Unable to download PDF");
    }
  };

  return (
    <div className="container mt-4">
      <h2>My Patients' Medical Records</h2>

      {loading ? (
        <p>Loading records...</p>
      ) : records.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Patient</th>
              <th>Diagnosis</th>
              <th>Prescriptions</th>
              <th>Lab Results</th>
              <th>Notes</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id}>
                <td>
                  {rec.patient.first_name} {rec.patient.last_name} <br />
                  <small>@{rec.patient.username}</small>
                </td>
                <td>{rec.diagnosis}</td>
                <td>{rec.prescriptions || "-"}</td>
                <td>
                  {rec.lab_results_url ? (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => downloadPDF(rec.id)}
                    >
                      Download PDF
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{rec.notes || "-"}</td>
                <td>{new Date(rec.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DoctorMedicalRecords;
