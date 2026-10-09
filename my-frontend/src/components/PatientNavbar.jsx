import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/components/Navbar.css';
import { FaUserCircle } from 'react-icons/fa';
import logo from '../assets/Logo.jpeg';

const PatientNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">

        <Link className="navbar-logo" to="/dashboard/patient">
          <img src={logo} alt="Logo" />
          <h4>DeepHeal HMS</h4>
        </Link>

        <ul className="navbar-links">
          <li><Link to="/dashboard/patient">Dashboard</Link></li>
          <li><Link to="/appointment">Appointment</Link></li>
          <li><Link to="/lab-test">Lab Test</Link></li>
          <li><Link to="/depression">Depression Analysis</Link></li>
          <li><Link to="/about-us">About Us</Link></li>
        </ul>

        <div className="navbar-auth">
          <div className="dropdown">
            <button className="dropdown-toggle">
              <FaUserCircle size={20} /> Account
            </button>

            <ul className="dropdown-menu">
              <li><Link to="/dashboard/patient">Dashboard</Link></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default PatientNavbar;
