import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        logout();
        return;
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/accounts/user/me/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsername(response.data.username);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        logout(); // Logout on failure to avoid access with invalid token
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Welcome, Admin {username ? username : '...'}</h2>
      <div className="row mt-4">
        <div className="col-md-4 mb-3">
          <button onClick={() => navigate('/admin')} className="btn btn-primary w-100">Manage Users</button>
        </div>
        <div className="col-md-4 mb-3">
          <button onClick={() => navigate('/appointment')} className="btn btn-info w-100">View Appointments</button>
        </div>
        <div className="col-md-4 mb-3">
          <button onClick={() => navigate('/lab-reports')} className="btn btn-secondary w-100">View Lab Reports</button>
        </div>
        <div className="col-md-4 mb-3">
          <button onClick={logout} className="btn btn-danger w-100">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
