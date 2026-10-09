import React from 'react';
import '../styles/components/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-row">
          <div className="footer-col">
            <h4 className="footer-logo">DeepHeal HMS</h4>
            <p>Empowering healthcare through technology.</p>
          </div>

          <div className="footer-col">
            <h5>Quick Links</h5>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/appointment">Appointments</a></li>
              <li><a href="/lab-test">Lab Tests</a></li>
              <li><a href="/Depression">Depression Analysis</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Contact Us</h5>
            <p>Email: support@deepheal.com</p>
            <p>Phone: 051-123456</p>
            <p>Location: Lahore, Pakistan</p>
          </div>
        </div>

        <hr />
        <p className="footer-bottom">
          &copy; {new Date().getFullYear()} DeepHeal HMS. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
