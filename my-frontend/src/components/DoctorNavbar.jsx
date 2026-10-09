import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/components/Navbar.css';
import { FaUserCircle } from 'react-icons/fa';
import logo from '../assets/Logo.jpeg';

const DoctorNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">

        <Link className="navbar-logo" to="/dashboard/doctor">
          <img src={logo} alt="Logo" />
          <h4>DeepHeal HMS</h4>
        </Link>

        <ul className="navbar-links">
          <li><Link to="/dashboard/doctor">Doctor Dashboard</Link></li>
          <li><Link to="/doctor/add-record">Add Prescriptions</Link></li>
          <li><Link to="/doctor/records">Medical Records</Link></li>
          <li><Link to="/doctor/lab-tests">Lab Tests</Link></li>
          <li><Link to="/doctor/lab-tests">Depression Analysis</Link></li>
        </ul>

        <div className="navbar-auth">
          <div className="dropdown">
            <button className="dropdown-toggle">
              <FaUserCircle size={20} /> Account
            </button>

            <ul className="dropdown-menu">
              <li><Link to="/dashboard/doctor">Dashboard</Link></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default DoctorNavbar;
