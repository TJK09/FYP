import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/components/Navbar.css';
import { FaUserCircle } from 'react-icons/fa';
import logo from '../assets/Logo.jpeg';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        {/* Logo and Title */}
        <Link className="navbar-logo" to="/">
          <img src={logo} alt="Logo" />
          <h4>DeepHeal HMS</h4>
        </Link>

        {/* Main Navigation Links */}
        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/appointment">Appointment</Link></li>
          <li><Link to="/lab-test">Lab Test</Link></li>
          <li><Link to="/Depression">Depression Analysis</Link></li>
          <li><Link to="/About-Us">About Us</Link></li>

          {/* Role-specific links */}
          {role === 'doctor' && (
            <li><Link to="/dashboard/doctor">Doctor Dashboard</Link></li>
          )}
          {role === 'patient' && (
            <li><Link to="/dashboard/patient">Patient Dashboard</Link></li>
          )}
          {role === 'admin' && (
            <li><Link to="/dashboard/admin">Admin Dashboard</Link></li>
          )}
        </ul>

        {/* Authentication Buttons */}
        <div className="navbar-auth">
          {!token ? (
            <Link to="/login" className="btn-login">Login</Link>
          ) : (
            <div className="dropdown">
              <button className="dropdown-toggle">
                <FaUserCircle size={20} className="me-1" /> Account
              </button>
              <ul className="dropdown-menu">
                {role === 'doctor' && (
                  <li><Link to="/dashboard/doctor">Dashboard</Link></li>
                )}
                {role === 'patient' && (
                  <li><Link to="/dashboard/patient">Dashboard</Link></li>
                )}
                {role === 'admin' && (
                  <li><Link to="/dashboard/admin">Dashboard</Link></li>
                )}
                <li><button onClick={handleLogout}>Logout</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
