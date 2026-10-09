// src/pages/DoctorAddRecord.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/pages/DoctorAdd.css';

const DoctorAddRecord = () => {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: '',          // must match serializer
    diagnosis: '',
    prescriptions: '',
    lab_results: '',
    notes: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('access_token');

  // Fetch patients for dropdown
  useEffect(() => {
    if (!token) {
      setError('Please log in first as a doctor.');
      return;
    }

    axios
      .get('http://127.0.0.1:8000/api/medicalrecord/patients/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPatients(res.data))
      .catch((err) => {
        console.error('Error fetching patients:', err);
        if (err.response && err.response.status === 401) {
          setError('Unauthorized. Please log in again.');
        } else {
          setError('Failed to load patients.');
        }
      });
  }, [token]);

  // Handle input change for all fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.patient_id) {
      setError('Please select a patient.');
      return;
    }

    if (!token) {
      setError('Unauthorized. Please log in first.');
      return;
    }

    axios
      .post(
        'http://127.0.0.1:8000/api/medicalrecord/records/create/',
        {
          patient_id: formData.patient_id,
          diagnosis: formData.diagnosis,
          prescriptions: formData.prescriptions,
          notes: formData.notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setMessage('Medical record added successfully!');
        setFormData({
          patient_id: '',
          diagnosis: '',
          prescriptions: '',
          lab_results: '',
          notes: '',
        });
      })
      .catch((err) => {
        console.error('Error adding medical record:', err);
        if (err.response && err.response.status === 401) {
          setError('Unauthorized. Please log in again.');
        } else if (err.response && err.response.data) {
          setError(`Failed: ${JSON.stringify(err.response.data)}`);
        } else {
          setError('Failed to add medical record. Please try again.');
        }
      });
  };

  return (
    <div className="doctor-record-container">
      <h2>Add Medical Record</h2>

      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="patient_id">Patient</label>
          <select
            name="patient_id"
            value={formData.patient_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Patient --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name} ({p.username})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="diagnosis">Diagnosis</label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            placeholder="Enter diagnosis details"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="prescriptions">Prescriptions</label>
          <textarea
            name="prescriptions"
            value={formData.prescriptions}
            onChange={handleChange}
            placeholder="Enter prescribed medicines"
          />
        </div>

        <div className="form-group">
          <label htmlFor="lab_results">Lab Results</label>
          <textarea
            name="lab_results"
            value={formData.lab_results}
            onChange={handleChange}
            placeholder="Enter lab results"
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes / Remarks</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional notes"
          />
        </div>

        <button type="submit">Add Record</button>
      </form>
    </div>
  );
};

export default DoctorAddRecord;
