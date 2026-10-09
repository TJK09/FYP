// src/pages/VerifyEmailToken.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyEmailToken = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying...');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setMessage('Invalid verification link.');
      return;
    }

    axios
      .get(`http://127.0.0.1:8000/accounts/verify-email/?token=${token}`)
      .then(() => {
        setMessage('Email verified successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch((error) => {
        if (error.response && error.response.data.detail) {
          setMessage(error.response.data.detail);
        } else {
          setMessage('Verification failed. Try again.');
        }
      });
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmailToken;
