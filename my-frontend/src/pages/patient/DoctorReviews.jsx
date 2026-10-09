// src/pages/DoctorReviews.jsx
import React, { useState } from 'react';
import Popup from '@/components/Popup';

const DoctorReviews = () => {
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Review submitted!');
    setShowPopup(false);
  };

  return (
    <div>
      <h2>Doctor Reviews</h2>
      <button onClick={() => setShowPopup(true)}>Leave a Review</button>

      {showPopup && (
        <Popup title="Submit Review" onClose={() => setShowPopup(false)}>
          <form onSubmit={handleSubmit}>
            <label>
              Doctor Name: <input type="text" required />
            </label><br />
            <label>
              Review: <textarea required></textarea>
            </label><br />
            <button type="submit">Submit</button>
          </form>
        </Popup>
      )}
    </div>
  );
};

export default DoctorReviews;
