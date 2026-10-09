import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const EmailVerificationStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('Verifying email...');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const verifyEmail = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/accounts/verify-email/?token=${token}`);
        setMessage(response.data.detail);
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);  // redirect after 3s
      } catch (error) {
        setMessage(
          error.response?.data?.detail || 'Email verification failed. The link may be expired or invalid.'
        );
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setMessage('Verification token not found.');
    }
  }, [location.search, navigate]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Email Verification</h2>
      <p>{message}</p>
      {success && <p>Redirecting to login...</p>}
    </div>
  );
};

export default EmailVerificationStatus;
