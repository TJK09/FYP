import React from 'react';
import "../styles/pages/About.css";

const AboutUs = () => {
  return (
    <div className="container py-5">
      <h1 className="mb-4 text-center">About Us</h1>

      <section className="mb-5">
        <h2>Our Hospital Management System</h2>
        <p>
          Our Hospital Management System is designed to simplify and streamline the day-to-day
          operations of healthcare providers. We aim to deliver efficient, reliable, and secure
          healthcare management through a user-friendly digital platform.
        </p>
      </section>

      <section className="mb-5">
        <h2>Meet Our Doctors</h2>
        <ul>
          <li><strong>Dr. Taj Khan</strong> – Cardiologist</li>
          <li><strong>Dr. Muhammad Rehman</strong> – Dermatologist</li>
          <li><strong>Dr. Mehmood Ul Hassan</strong> – Neurologist</li>
          <li><strong>Dr. Anwar Khan</strong> – Orthopedic Specialist</li>
          <li><strong>Dr. Fatima Zahid</strong> – Orthopedic Specialist</li>
          <li><strong>Dr. Ali Raza</strong> – Orthopedic Specialist</li>
        </ul>
      </section>

      <section className="mb-5">
        <h2>Our Services</h2>
        <ul>
          <li><strong>Appointment Booking:</strong> Easily book appointments with our expert doctors at your convenience.</li>
          <li><strong>Medical Records:</strong> Securely store and access your medical history anytime, anywhere.</li>
          <li><strong>Lab Tests:</strong> Schedule lab tests and get your results directly through our system.</li>
          <li><strong>Depression Analysis:</strong> Access mental health assessments and support through our integrated depression analysis tool.</li>
        </ul>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>
          Have questions or need support? Reach out to our team anytime. We’re here to help you
          on your healthcare journey.
        </p>
      </section>
    </div>
  );
};

export default AboutUs;
