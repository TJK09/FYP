import React from 'react';
import '../../styles/pages/LabReports.css';

const LabReports = () => {
  return (
    <div className="lab-reports">
      <h2>Lab Reports</h2>
      <ul>
        <li>Blood Test - 2024-03-01 - <a href="#">View Report</a></li>
        <li>X-Ray - 2024-02-15 - <a href="#">View Report</a></li>
        <li>COVID Test - 2024-01-05 - <a href="#">View Report</a></li>
      </ul>
    </div>
  );
};

export default LabReports;
