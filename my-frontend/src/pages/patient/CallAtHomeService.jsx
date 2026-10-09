import React, { useState } from 'react';
import Popup from '@/components/Popup'; 
import { Button, Form } from 'react-bootstrap'; 
import '../../styles/pages/CallAtHomeService.css'; 
import homeservice from '../../assets/callathome.jpg'; 

const CallAtHomeService = () => {
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Service Request Sent!");
    setShowPopup(false); 
  };

  return (
    <div className="call-home">
      <div className="intro-section text-center mb-5">
        <h2>Our Home Service - Convenient, Fast, and Reliable</h2>
        <p>
          Need assistance at home? We provide professional services right at your doorstep. Whether you require a plumbing service, electrical work, or a simple home appliance repair, our team of experts is ready to help.
        </p>
        <img 
          src={homeservice} 
          alt="Home Service" 
          className="img-fluid mb-4" 
        />
        <p>
          Book a home service appointment with us today and get the help you need, when you need it!
        </p>
      </div>

      {/* Button to open the popup */}
      <div className="text-center mb-4">
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowPopup(true)}
        >
          Request Service
        </Button>
      </div>

      {/* Conditionally render the Popup */}
      {showPopup && (
        <Popup title="Home Service Request" onClose={() => setShowPopup(false)} show={showPopup}>
          <Form onSubmit={handleSubmit}>
            {/* Name Field */}
            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Enter your name" required />
            </Form.Group>

            {/* Contact Number Field */}
            <Form.Group controlId="formContact" className="mb-3">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control type="tel" placeholder="Enter your contact number" required />
            </Form.Group>

            {/* Address Field */}
            <Form.Group controlId="formAddress" className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Enter your address" required />
            </Form.Group>

            {/* Service Needed Field with Scroll */}
            <Form.Group controlId="formServiceNeeded" className="mb-3">
              <Form.Label>Service Needed</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Describe the service needed"
                style={{ resize: 'vertical', maxHeight: '150px' }}
                required
              />
            </Form.Group>

            {/* Preferred Time Field */}
            <Form.Group controlId="formPreferredTime" className="mb-3">
              <Form.Label>Preferred Time</Form.Label>
              <Form.Control type="time" required />
            </Form.Group>

            {/* Submit Button */}
            <div className="text-center">
              <Button variant="success" type="submit">
                Submit Request
              </Button>
            </div>
          </Form>
        </Popup>
      )}
    </div>
  );
};

export default CallAtHomeService;
