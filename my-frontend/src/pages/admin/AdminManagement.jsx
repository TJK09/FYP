import React from 'react';

const AdminManagement = () => {
  return (
    <div>
      <h2>Admin Management</h2>
      <p>Only accessible to admins. Manage patient records and appointments here.</p>
      <ul>
        <li>View All Appointments</li>
        <li>Update Patient Info</li>
        <li>Delete Inactive Records</li>
      </ul>
    </div>
  );
};

export default AdminManagement;
