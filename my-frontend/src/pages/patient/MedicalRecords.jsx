import React, { useEffect, useState } from "react";
import axios from "axios";

const PatientMedicalRecords = () => {
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
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRecords(res.data);
      } catch (err) {
        console.error("Error fetching patient records:", err);
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, [token]);

 const downloadFile = async (recordId) => {
  try {
    const res = await axios.get(
      `http://127.0.0.1:8000/api/medicalrecord/records/${recordId}/file/`,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Use filename from Content-Disposition
    const disposition = res.headers['content-disposition'];
    let filename = `LabReport_${recordId}`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?(.+)"?/);
      if (match && match[1]) filename = match[1];
    }

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);
    alert("Unable to download file");
  }
};


  return (
    <div className="container mt-4">
      <h2>Your Medical Records</h2>
      {loading ? (
        <p>Loading records...</p>
      ) : records.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Diagnosis</th>
              <th>Prescriptions</th>
              <th>File</th>
              <th>Notes</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id}>
                <td>
                  {rec.doctor
                    ? `${rec.doctor.first_name} ${rec.doctor.last_name} (@${rec.doctor.username})`
                    : "N/A"}
                </td>
                <td>{rec.diagnosis}</td>
                <td>{rec.prescriptions || "-"}</td>
                <td>
                  {rec.lab_results_url ? (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => downloadFile(rec.id)}
                    >
                      Download
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{rec.notes || "-"}</td>
                <td>{new Date(rec.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatientMedicalRecords;
